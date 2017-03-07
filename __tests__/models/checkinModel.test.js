const query = (method = 'GET', classOrFunc, objOrFilter = {}) => {
  let uri = classOrFunc
  let request = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': process.env.APP_ID,
      'X-Parse-REST-API-Key': process.env.REST_API_KEY
    }
  }
  let sessionToken = localStorage.getItem('sessionToken')
  if (sessionToken) request.headers['X-Parse-Session-Token'] = sessionToken
  if (method === 'POST' || method === 'PUT') {
    request.body = JSON.stringify(objOrFilter)
  }
  return fetch(encodeURI(process.env.SERVER_URL + uri), request).then((response) => response.json())
}

const getCloudCodeFunction = (funcName, data) => {
  return query('POST', '/functions/' + funcName, data)
}

exports.getCloudCodeFunction = getCloudCodeFunction;