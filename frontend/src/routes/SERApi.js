import $ from 'jquery'

import EBMPApi from './EBMPApi'


const getSERmodels = async () => {
	const url = EBMPApi.getDomain() + 'speech-emotion-recognition/models';

	const result =  await $.ajax(url, {
		type: 'GET',
		dataType: 'json',
	})
	.done((response) => {
		if (response && response.data && response.data.length > 0) {
      return response.data;
		}

		EBMPApi.responseAlert(response, url);
	})
	.fail((xhr, textStatus, errorThrown) => {
		alert('Failed retrieving models from backend. Error: ' + xhr.responseText); 
	});
	
	return result;
};

const getEmotionPrediction = async (formData) => {
	const url = EBMPApi.getDomain() + 'speech-emotion-recognition/predict';

	const result = await $.ajax(url, {
		type: 'POST',
		dataType: 'json',
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
	})
	.done((response) => {
		if (response && response.data && response.data.length > 0) {
      return response.data;
		}

		EBMPApi.responseAlert(response, url);
		
	})
	.fail((xhr, textStatus, errorThrown) => {
		alert('Failed retrieving prediction from backend. Error: ' + xhr.responseText); 
	});

	return result;
}

const SERApi = {
  getSERmodels,
	getEmotionPrediction
};

export default SERApi;
