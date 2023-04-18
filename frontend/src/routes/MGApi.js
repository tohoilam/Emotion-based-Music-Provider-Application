import EBMPApi from './EBMPApi'
import JSZip from 'jszip';

const getMusicGeneration = async (formData) => {
	const url = EBMPApi.getDomain() + 'music-generation/generate';

	const result = await fetch(url, {
			method: 'post',
			body: formData,
	})
		.then(response => {
			if (response.ok) {
				return response.blob();
			} else {
				throw new Error('Download failed');
			}
		})
		.then(blob => {
			// Create a new JSZip instance and load the binary data from the blob
			const zip = new JSZip();
			return zip.loadAsync(blob);
		})
		.then(zip => {
			// Extract the file with the filename 'audio1.wav' from the ZIP file

			const audioData1 = zip.file('generated0.wav').async('arraybuffer')
			const audioData2 = zip.file('generated1.wav').async('arraybuffer')
			const audioData3 = zip.file('generated2.wav').async('arraybuffer')
			const jsonData = zip.file('info.json').async('string');
			
			return Promise.all([audioData1, audioData2, audioData3, jsonData]);
		})
		.then(([audioData1, audioData2, audioData3, jsonData]) => {
			const blobUrlList = [
				URL.createObjectURL(new Blob([audioData1], { type: 'audio/wav' })),
				URL.createObjectURL(new Blob([audioData2], { type: 'audio/wav' })),
				URL.createObjectURL(new Blob([audioData3], { type: 'audio/wav' }))
			]

			const infoData = JSON.parse(jsonData);
				
			return {
				'generatedMusic': [
					{
						"blobUrl": blobUrlList[0],
						"primers": infoData['generated_music'][0]['primers_info'],
						"generated": infoData['generated_music'][0]['generated_info'],
						"name": "Generated Music 1"
					},
					{
						"blobUrl": blobUrlList[1],
						"primers": infoData['generated_music'][1]['primers_info'],
						"generated": infoData['generated_music'][1]['generated_info'],
						"name": "Generated Music 2"
					},
					{
						"blobUrl": blobUrlList[2],
						"primers": infoData['generated_music'][2]['primers_info'],
						"generated": infoData['generated_music'][2]['generated_info'],
						"name": "Generated Music 3"
					},
				],
				'speech_info': infoData['speech']
			};
		})
		.catch(error => {
			console.error(error);
		});

	return result;
}

const MGApi = {
	getMusicGeneration
};

export default MGApi;

// const result = await $.ajax(url, {
// 	type: 'POST',
// 	// dataType: 'blob',
// 	xhr: function(){
// 		var xhr = new XMLHttpRequest();
// 		xhr.responseType= 'blob'
// 		return xhr;
// 	},
// 	data: formData,
// 	cache: false,
// 	contentType: false,
// 	processData: false,
// })
