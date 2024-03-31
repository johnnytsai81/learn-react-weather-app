import {useEffect, useState, useCallback} from 'react';

const useWeatherAPI = ({locationName, cityName, authorizationKey}) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    comfortability: '',
    weatherCode: 0,
    isLoading: true,
  });

  const fetchWeatherForecast = ({authorizationKey, cityName}) => {
    return fetch(
      `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`
    ).then((response) => response.json().then((data) => {
      const locationData = data.records.location[0];
      console.log(locationData);
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    }));
  }

  const fetchCurrentWeather = async ({authorizationKey, locationName}) => {
    const response = await fetch(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&StationName=${locationName}`);
    const data = await response.json();
    const locationData = data.records.Station[0];

    return {
      observationTime: locationData.ObsTime.DateTime,
      locationName: locationData.StationName,
      description: locationData.WeatherElement.Weather,
      windSpeed: locationData.WeatherElement.WindSpeed,
      temperature: locationData.WeatherElement.AirTemperature,
      isLoading: false,
    };
  }

  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    const [currentWeather, weatherForecast] = await Promise.all([
      fetchWeatherForecast({authorizationKey, cityName}),
      fetchCurrentWeather({authorizationKey, locationName})
    ]);

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    })
  }, [authorizationKey, cityName, locationName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
}

export default useWeatherAPI;