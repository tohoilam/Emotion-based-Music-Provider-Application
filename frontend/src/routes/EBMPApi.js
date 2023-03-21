
const getDomain = () => {
	// const domain = "https://ebmp-api.herokuapp.com/";
	const domain = "http://localhost:5000/";

	return domain;
}

const responseAlert = (response, url) => {
	if (response) {
		if (response.status !== 'ok') {
			alert(`Failed calling ${url}!\n`
						 +`${response.staus} in backend with error message ${response.errMsg}!`);
		}
		else {
			alert(`Failed calling ${url}!\n`
						+'Empty response data from backend');
		}
	}
	else {
		alert(`Failed calling ${url}!\n`
					+'No response from backend')
	}
}

const EBMPApi = {
  getDomain,
	responseAlert
};

export default EBMPApi;