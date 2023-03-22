import React, { useEffect } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'

import './RecordButton.css'


export const RecordButton = ({audioList, setRecordedAudio}) => {
	const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: false });

	useEffect(() => {
		const prepareRecording = async () => {
			if (status === 'stopped') {

				const fileName = new Date().toLocaleString('en-US', {
																timeZone: 'Hongkong'
															})
															.replaceAll(',', '')
															.replaceAll('/', '-')
															.replace(':', 'h')
															.replace(':', 'm');

				// const className = fileName.replaceAll(' ', '-');

				const blob = await fetch(mediaBlobUrl).then(r => r.blob());
				blob.name = fileName + ".wav";

				const audioObject = {
					blob: blob,
					blobUrl: mediaBlobUrl,
					fileName: fileName + ".wav",
					className: audioList.length.toString()
				}
				
				setRecordedAudio(audioObject);
				

			}
		}

		prepareRecording();

    // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status])

  return (
    <div data-role="controls" className='record-box'>
      <button data-recording={status} onClick={(status === "recording") ? stopRecording : startRecording}>Record</button>
    </div>
  )
}
