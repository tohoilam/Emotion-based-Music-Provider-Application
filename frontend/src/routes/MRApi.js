import $ from 'jquery'

import EBMPApi from './EBMPApi'

const getMusicRecommendation = async (formData) => {
	// const url = EBMPApi.getDomain() + 'music-recommendation/getsongs';
	const url = EBMPApi.getDomain() + 'music-recommendation/dummy';

	const result = await $.ajax(url, {
		type: 'POST',
		dataType: 'json',
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
	})
	.done((response) => {
		if (response && response.data) {
      return response.data;
		}

		EBMPApi.responseAlert(response, url);
		
	})
	.fail((xhr, textStatus, errorThrown) => {
		alert('Failed retrieving recommendation from backend. Error: ' + xhr.responseText); 
	});

	return result;
}

const getLyrics = async (genius_id) => {
	const url = EBMPApi.getDomain() + 'music-recommendation/getlyrics/' + genius_id;

	const result = await $.ajax(url)
		.done((response) => {
			if (response && response.data) {
				return response.data;
			}

			EBMPApi.responseAlert(response, url);
			
		})
		.fail((xhr, textStatus, errorThrown) => {
			alert('Failed retrieving recommendation from backend. Error: ' + xhr.responseText); 
		});

	return result;
}

const MRApi = {
	getMusicRecommendation,
	getLyrics
};

export default MRApi;
