import { faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CircularProgress, TextField, Box, Tooltip, Backdrop } from '@mui/material';
import { GoogleMap, useLoadScript, Circle, Marker } from '@react-google-maps/api';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCsrf from '../../hooks/useCsrf';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';
import axios from '../../lib/axiosSetting';

type FormData = {
  address: string;
};

type TypeWorkspotNewRequestResponse = {
  message: string;
  workspotName: string;
};

const mapContainerStyle = {
  height: '60vh',
  width: '100%',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const WorkspotNewPage = () => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: 35.1346609, lng: 136.9381131 });
  const { control, handleSubmit, reset } = useForm<FormData>();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'default',
  });

  const mapRef = useRef<google.maps.Map>();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const params = {
        lat: mapRef.current?.getCenter()?.lat(),
        lng: mapRef.current?.getCenter()?.lng(),
      };
      const result = await axios.post<TypeWorkspotNewRequestResponse>('workspot/new', params);
      enqueueSnackbar(`${result.data.workspotName}を登録しました`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(`登録に失敗しました`, { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async () => {
    const latlng = {
      lat: mapRef.current?.getCenter()?.lat() || 35.1346609,
      lng: mapRef.current?.getCenter()?.lng() || 136.9381131,
    };
    setCenter(latlng);
  };

  const onSearch = async (data: FormData) => {
    setLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: data.address });
      const latlng = {
        lat: result.results[0].geometry.location.lat(),
        lng: result.results[0].geometry.location.lng(),
      };
      setCenter(latlng);
      reset({ address: '' });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Layout title='ミズホエンジニアリング | 勤務地登録'>
        {isUserLoading ? (
          <CircularProgress />
        ) : !userInfo.role ? (
          <ErrorComponent></ErrorComponent>
        ) : userInfo.role !== 'admin' ? (
          <PermissionErrorComponent></PermissionErrorComponent>
        ) : (
          <>
            <Box>
              {!isLoaded ? (
                <CircularProgress />
              ) : loadError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <Box>
                  <form onSubmit={handleSubmit(onSearch)}>
                    <div className='form'>
                      <Controller
                        name='address'
                        control={control}
                        defaultValue=''
                        render={({ field }) => (
                          <TextField
                            sx={{ display: 'inline-block', width: '20rem' }}
                            fullWidth
                            size='small'
                            label='住所'
                            {...field}
                          />
                        )}
                      />
                      <Tooltip title='検索'>
                        <button className='resetButton' type='submit'>
                          <FontAwesomeIcon className='icon' icon={faSearch} size='2x' />
                        </button>
                      </Tooltip>
                    </div>
                  </form>
                  <Box sx={{ margin: '1.5rem 0' }}>
                    <GoogleMap
                      id='map'
                      mapContainerStyle={mapContainerStyle}
                      zoom={14}
                      center={center}
                      options={options}
                      onLoad={onMapLoad}
                      onDragEnd={onDragEnd}
                    >
                      <Circle center={center} radius={1000} />
                      <Marker position={center} />
                    </GoogleMap>
                  </Box>
                  <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Button
                      sx={{ width: '13rem' }}
                      variant='outlined'
                      onClick={async () => onSubmit()}
                    >
                      登録
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}
      </Layout>
    </>
  );
};

export default WorkspotNewPage;
