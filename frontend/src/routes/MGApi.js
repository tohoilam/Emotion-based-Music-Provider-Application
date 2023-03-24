import $ from 'jquery'

import EBMPApi from './EBMPApi'

const getMusicGeneration = async (formData) => {
	const url = EBMPApi.getDomain() + 'music-generation/generate';

	const result = await $.ajax(url, {
		type: 'POST',
		dataType: 'json',
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
	})
	.done((response) => {
		if (response) {
      return response;
		}

		EBMPApi.responseAlert(response, url);
		
	})
	.fail((xhr, textStatus, errorThrown) => {
		alert('Failed retrieving generation from backend. Error: ' + xhr.responseText); 
	});

	return result;
}

const MGApi = {
	getMusicGeneration
};

export default MGApi;
