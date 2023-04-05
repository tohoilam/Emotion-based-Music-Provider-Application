from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import collections
import pretty_midi

_PRETTY_MIDI_MAJOR_TO_MINOR_OFFSET = 12

# Standard pulses per quarter.
# https://en.wikipedia.org/wiki/Pulses_per_quarter_note
STANDARD_PPQ = 220
DEFAULT_QUARTERS_PER_MINUTE = 120.0


def note_sequence_to_pretty_midi(
    sequence, drop_events_n_seconds_after_last_note=None):
  """Convert NoteSequence to a PrettyMIDI.
  Time is stored in the NoteSequence in absolute values (seconds) as opposed to
  relative values (MIDI ticks). When the NoteSequence is translated back to
  PrettyMIDI the absolute time is retained. The tempo map is also recreated.
  Args:
    sequence: A NoteSequence.
    drop_events_n_seconds_after_last_note: Events (e.g., time signature changes)
        that occur this many seconds after the last note will be dropped. If
        None, then no events will be dropped.
  Returns:
    A pretty_midi.PrettyMIDI object or None if sequence could not be decoded.
  """
  ticks_per_quarter = sequence.ticks_per_quarter or STANDARD_PPQ

  max_event_time = None
  if drop_events_n_seconds_after_last_note is not None:
    max_event_time = (max([n.end_time for n in sequence.notes] or [0]) +
                      drop_events_n_seconds_after_last_note)

  # Try to find a tempo at time zero. The list is not guaranteed to be in order.
  initial_seq_tempo = None
  for seq_tempo in sequence.tempos:
    if seq_tempo.time == 0:
      initial_seq_tempo = seq_tempo
      break

  kwargs = {}
  if initial_seq_tempo:
    kwargs['initial_tempo'] = initial_seq_tempo.qpm
  else:
    kwargs['initial_tempo'] = DEFAULT_QUARTERS_PER_MINUTE

  pm = pretty_midi.PrettyMIDI(resolution=ticks_per_quarter, **kwargs)

  # Create an empty instrument to contain time and key signatures.
  instrument = pretty_midi.Instrument(0)
  pm.instruments.append(instrument)

  # Populate time signatures.
  for seq_ts in sequence.time_signatures:
    if max_event_time and seq_ts.time > max_event_time:
      continue
    time_signature = pretty_midi.containers.TimeSignature(
        seq_ts.numerator, seq_ts.denominator, seq_ts.time)
    pm.time_signature_changes.append(time_signature)

  # Populate key signatures.
  for seq_key in sequence.key_signatures:
    if max_event_time and seq_key.time > max_event_time:
      continue
    key_number = seq_key.key
    if seq_key.mode == seq_key.MINOR:
      key_number += _PRETTY_MIDI_MAJOR_TO_MINOR_OFFSET
    key_signature = pretty_midi.containers.KeySignature(
        key_number, seq_key.time)
    pm.key_signature_changes.append(key_signature)

  # Populate tempos.
  # TODO(douglaseck): Update this code if pretty_midi adds the ability to
  # write tempo.
  for seq_tempo in sequence.tempos:
    # Skip if this tempo was added in the PrettyMIDI constructor.
    if seq_tempo == initial_seq_tempo:
      continue
    if max_event_time and seq_tempo.time > max_event_time:
      continue
    tick_scale = 60.0 / (pm.resolution * seq_tempo.qpm)
    tick = pm.time_to_tick(seq_tempo.time)
    # pylint: disable=protected-access
    pm._tick_scales.append((tick, tick_scale))
    pm._update_tick_to_time(0)
    # pylint: enable=protected-access

  # Populate instrument names by first creating an instrument map between
  # instrument index and name.
  # Then, going over this map in the instrument event for loop
  inst_infos = {}
  for inst_info in sequence.instrument_infos:
    inst_infos[inst_info.instrument] = inst_info.name

  # Populate instrument events by first gathering notes and other event types
  # in lists then write them sorted to the PrettyMidi object.
  instrument_events = collections.defaultdict(
      lambda: collections.defaultdict(list))
  for seq_note in sequence.notes:
    instrument_events[(seq_note.instrument, seq_note.program,
                       seq_note.is_drum)]['notes'].append(
                           pretty_midi.Note(
                               seq_note.velocity, seq_note.pitch,
                               seq_note.start_time, seq_note.end_time))
  for seq_bend in sequence.pitch_bends:
    if max_event_time and seq_bend.time > max_event_time:
      continue
    instrument_events[(seq_bend.instrument, seq_bend.program,
                       seq_bend.is_drum)]['bends'].append(
                           pretty_midi.PitchBend(seq_bend.bend, seq_bend.time))
  for seq_cc in sequence.control_changes:
    if max_event_time and seq_cc.time > max_event_time:
      continue
    instrument_events[(seq_cc.instrument, seq_cc.program,
                       seq_cc.is_drum)]['controls'].append(
                           pretty_midi.ControlChange(
                               seq_cc.control_number,
                               seq_cc.control_value, seq_cc.time))

  for (instr_id, prog_id, is_drum) in sorted(instrument_events.keys()):
    # For instr_id 0 append to the instrument created above.
    if instr_id > 0:
      instrument = pretty_midi.Instrument(prog_id, is_drum)
      pm.instruments.append(instrument)
    else:
      instrument.is_drum = is_drum
    # propagate instrument name to the midi file
    instrument.program = prog_id
    if instr_id in inst_infos:
      instrument.name = inst_infos[instr_id]
    instrument.notes = instrument_events[
        (instr_id, prog_id, is_drum)]['notes']
    instrument.pitch_bends = instrument_events[
        (instr_id, prog_id, is_drum)]['bends']
    instrument.control_changes = instrument_events[
        (instr_id, prog_id, is_drum)]['controls']

  return pm