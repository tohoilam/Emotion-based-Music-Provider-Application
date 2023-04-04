import React, { useState, useEffect, useRef } from 'react'

import { RecordButton } from '../../common/RecordButton/RecordButton'
import SERApi from '../../routes/SERApi'

import './SpeechEmotionRecognition.css'

export const SpeechEmotionRecognition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
	const [audioList, setAudioList] = useState([]);
	const [dropActive, setDropActive] = useState([]);
	const [emotionResponseList, setEmotionResponseList] = useState([]);
	const [recordedAudio, setRecordedAudio] = useState(null);
	const audioFileInputRef= useRef(null);
	const modelChoiceRef = useRef(null);

  // const sampleRate = 16000;

	const dropFiles = (e) => {
		e.preventDefault();
		e.stopPropagation();

		setDropActive(false);
		storeFiles(e.dataTransfer.files)
	}

	const storeFiles = (files) => {
		const NUM_OF_STORED_FILES = audioList.length;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			// if (file.type != 'audio/wav' || file.type != 'audio/x-m4a' || file.type != 'audio/mpeg'  || file.type != 'audio/ogg')
			if (file.type !== 'audio/wav' && file.type !== 'audio/x-m4a'
				&& file.type !== 'audio/mpeg' && file.type !== 'audio/ogg'
				&& file.type !== 'audio/basic') {
				
				const errMsg = "Please only upload .wav, .m4a, .mp3, .ogg, .opus, or .au file type!";
				alert(errMsg);
				break;
			}
			else {
				let blobUrl = (window.URL || window.webkitURL).createObjectURL(file);
				let className = NUM_OF_STORED_FILES + i;

				const audioObject = {
					blob: file,
					blobUrl: blobUrl,
					fileName: file.name,
					className: className.toString(),
				}
	
				setAudioList(audioList => [...audioList, audioObject]);
			}
		}
	}

	const predict = async () => {
		setIsLoading(true);

		const modelChoice = modelChoiceRef.current.value;
		
		let formData = new FormData();
		formData.append('modelChoice', modelChoice);

		for (let i = 0; i < audioList.length; i++) {
			const blob = audioList[i]['blob'];
			const filename = audioList[i]['fileName'];
			const className = audioList[i]['className'];


			formData.append(className, blob, filename);
		}

		const response = await SERApi.getEmotionPrediction(formData);
		if (response && response.data) {
			setEmotionResponseList(response.data);
		}

		setIsLoading(false);
	}

  useEffect(() => {
    const fetchSERModels = async () => {
      setIsLoading(true);
      const response = await SERApi.getSERmodels();
      if (response && response.data) {
        setModels(response.data);
      }
      
      setIsLoading(false);
    }

    fetchSERModels();
  }, [])

  useEffect(() => {
    if (recordedAudio) {
			setAudioList(audioList => [...audioList, recordedAudio]);
    }
  }, [recordedAudio]);

  return (
    (isLoading)
    ? <div id="loading" loading-active="True">
        <div id="loader"></div>
      </div>
    :
    <div className='speech-emotion-recognition'>
      <div id="container">
        <header>Speech Emotion Recognition</header>
        <section id="model-section">
          <select name="model-selection" id="model-selection" defaultValue={1} ref={modelChoiceRef} >
            <option disabled value> -- select a model -- </option>
            {
              (models !== null)
              ? models.map(data => <option key={data.id} value={data.id}>{data.name}</option>)
              : ""
            }
          </select>
        </section>
        <section id="file-upload">
          <h1 className="file-upload-header">File Upload</h1>
          <form id="upload-form" action="#" drop-active={dropActive.toString()}
										onClick={() => {audioFileInputRef.current.click()}}
										onDragOver={(e) => {e.preventDefault();e.stopPropagation();setDropActive(true)}}
										onDragLeave={() => {setDropActive(false)}}
										onDrop={(e) => {dropFiles(e)}}>
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Browse File to Upload</p>
          </form>
          <input type="file" id="file-input" onChange={(e) => storeFiles(e.target.files)} ref={audioFileInputRef} multiple />
        </section>
        <section id="recording-section">
          <h1 className="recording-header">Record</h1>
          <div id="recording-control">
            {/* <div data-role="controls">
							<button data-recording={status} onClick={(status === "recording") ? stopRecording : startRecording}>Record</button>
            </div> */}
						<RecordButton audioList={audioList} setRecordedAudio={setRecordedAudio}></RecordButton>
          </div>
        </section>
        <section id="predict-button-section">
          <button data-role="predict-emotion-button" onClick={predict} >Predict Emotion</button>
          <img src="../static/labels.png" alt="" id="label_image" />
        </section>
        <section id="audio-section">
          <div data-role="recordings">
						{
							(audioList)
							? audioList.map((audio) => {


								return (
									<div key={audio['className']} className="audio-row">
										<div className="audio-name">{audio['fileName']}</div>
										<div className="audio-holder">
											<audio src={audio['blobUrl']} controls></audio>
										</div>
										{/* eslint-disable jsx-a11y/anchor-is-valid */}
										<a className="download" href={audio['blobUrl']} download={audio['fileName']}>&#9660;</a>
										<a className="expand">&#x2B;</a>
										<ul className="emotion-result">
											{
												(emotionResponseList)
												? emotionResponseList.filter(emotionResponse => 
														emotionResponse.name === audio['className']
													).map((data) => {
														let emotion = data.emotion;
														// let name = data.name.replaceAll('.wav', '').replaceAll(' ', '-');
														let section = data.section;
														let sectionClass = section.replaceAll(':', '').replaceAll(' ', '');
														let percentage = data.percentage;
														let anger_percentage = percentage.Anger ? parseFloat(percentage.Anger) * 100 : 0.0;
														let excitement_percentage = percentage.Excitement ? parseFloat(percentage.Excitement) * 100 : 0.0;
														let frustration_percentage = percentage.Frustration ? parseFloat(percentage.Frustration) * 100 : 0.0;
														let happiness_percentage = percentage.Happiness ? parseFloat(percentage.Happiness) * 100 : 0.0;
														let sadness_percentage = percentage.Sadness ? parseFloat(percentage.Sadness) * 100 : 0.0;
														let calmness_percentage = percentage.Calmness ? parseFloat(percentage.Calmness) * 100 : 0.0;

														let colorA = '#8B8484'; // Darker
														let colorB = '#B8B8B8'; // Lighter
							
														if (emotion === 'Anger') {
															// Red
															colorA = '#E61E1E';
															colorB = '#E18F89';
														}
														else if (emotion === 'Excitement') {
															// Yellow
															colorA = '#EBE300';
															colorB = '#CBD080';
														}
														else if (emotion === 'Frustration') {
															// Purple
															colorA = '#AD01A7';
															colorB = '#D67AC5';
														}
														else if (emotion === 'Happiness') {
															// Green
															colorA = '#00EB46';
															colorB = '#76D0A2';
														}
														else if (emotion === 'Calmness') {
															// Grey
															colorA = '#AFBBB5';
															colorB = '#DAE1DE';
														}
														else if (emotion === 'Sadness') {
															// Blue
															colorA = '#0093E9';
															colorB = '#80D0C7';
														}
														
														return (
															<li key={`${audio['className']}-${sectionClass}`} className="emotion-container">
																<div className={`emotion-section-result ${sectionClass}`} style={{backgroundColor: colorA, backgroundImage: `linearGradient(60deg, ${colorA}, ${colorB})`}}>
																	<span className="time">{section}</span>
																	<span className="emotion">{emotion}</span>
																</div>
																<div className="emotion-percentages">
																	<div className="specific-emotion-percentage anger-emotion" style={{width: `${anger_percentage}%`}}>{anger_percentage >= 10 ? anger_percentage.toFixed(1).toString() + "%" : ""}</div>
																	<div className="specific-emotion-percentage excitement-emotion" style={{width: `${excitement_percentage}%`}}>{excitement_percentage >= 10 ? excitement_percentage.toFixed(1).toString() + "%" : ""}</div>
																	<div className="specific-emotion-percentage frustration-emotion" style={{width: `${frustration_percentage}%`}}>{frustration_percentage >= 10 ? frustration_percentage.toFixed(1).toString() + "%" : ""}</div>
																	<div className="specific-emotion-percentage happiness-emotion" style={{width: `${happiness_percentage}%`}}>{happiness_percentage >= 10 ? happiness_percentage.toFixed(1).toString() + "%" : ""}</div>
																	<div className="specific-emotion-percentage sadness-emotion" style={{width: `${sadness_percentage}%`}}>{sadness_percentage >= 10 ? sadness_percentage.toFixed(1).toString() + "%" : ""}</div>											
																	<div className="specific-emotion-percentage calmness-emotion" style={{width: `${calmness_percentage}%`}}>{calmness_percentage >= 10 ? calmness_percentage.toFixed(1).toString() + "%" : ""}</div>
																</div>
															</li>
														)
												})
												: ""
											}
										</ul>
									</div>
								)
							})
							: ""
						}
          </div>
        </section>
      </div>
      <section id="mel-spectrogram-section" show="False">
        <button id="close-mel-spectrogram"><span>X</span></button>
      </section>
    </div>
  )
}
