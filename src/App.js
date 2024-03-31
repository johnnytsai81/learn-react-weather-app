import {useEffect, useState, useMemo} from 'react';
import styled from '@emotion/styled';
import {ThemeProvider} from '@emotion/react';
import { getMoment, findLocation } from './utils/helpers.js';

import WeatherCard from "./views/WeatherCard";
import WeatherSetting from "./views/WeatherSetting";
import useWeatherAPI from './hooks/useWeatherAPI.js';


const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({theme}) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = 'CWA-90B84CB3-7A2B-44E0-8C19-C36AEFDF5656';

const App = () => {
  // step1 定義currentCity狀態
  const [currentCity, setCurrentCity] = useState(()=> localStorage.getItem('cityName') || '臺北市');

  // step2 定義currentLocation常數，用findLocation找出currentCity的資料
  const currentLocation = useMemo(()=> findLocation(currentCity),[currentCity]);

  // step3 從currentLocation中取出cityName, locationName, sunriseCityName
  const {cityName, locationName, sunriseCityName} = currentLocation;

  // step4 用getMoment取得日出或日落的時間
  const moment = useMemo(()=>getMoment(sunriseCityName), [sunriseCityName]);

  // step5 使用useWeatherAPI hook
  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  });

  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark');
  },[moment]);


  const [currentPage, setCurrentPage] = useState('weatherCard');

  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage);
  };

  const handleCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  }

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === 'weatherCard' && (
          <WeatherCard
            cityName={cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}
        {currentPage === 'weatherSetting' && (
          <WeatherSetting
            setCurrentTheme={setCurrentTheme}
            handleCityChange={handleCityChange}
            handleCurrentPageChange={handleCurrentPageChange}
            cityName={cityName}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};
;

export default App;
