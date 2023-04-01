import React, { useEffect, useState } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'

import './RecordButton.css'


export const RecordButton = ({audioList, setRecordedAudio, diameter="100%"}) => {
	const [width, setWidth] = useState("100%");

	const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: false });

	useEffect(() => {
		setWidth(diameter);
	}, []);

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
					className: (audioList) ? audioList.length.toString() : "0"
				}
				
				setRecordedAudio(audioObject);
				

			}
		}

		prepareRecording();

    // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status])

  return (
    <div data-role="controls" className='record-box' style={{width: width}}>
      <button data-recording={status} onClick={(status === "recording") ? stopRecording : startRecording}>Record</button>
    </div>
  )
}
