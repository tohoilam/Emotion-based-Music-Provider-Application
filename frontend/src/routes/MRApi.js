import $ from 'jquery'

import EBMPApi from './EBMPApi'

const getMusicRecommendation = async (formData) => {
	const url = EBMPApi.getDomain() + 'music-recommendation/getsongs';

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
		alert('Failed retrieving recommendation from backend. Error: ' + xhr.responseText); 
	});

	return result;
}

const MRApi = {
	getMusicRecommendation
};

export default MRApi;
