import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { Button, CircularProgress, TextField, Box } from "@mui/material";
import { useSnackbar } from 'notistack'
import { Controller, useForm } from "react-hook-form";
import useAxios from "../../hooks/useAxios";
import useCurrentUser from "../../hooks/useCurrentUser";
import Layout from "../../components/Layout";
import { accessTokenState } from "../../components/atoms";
import { useRecoilValue } from "recoil";
import router from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import styles from '../../styels/workspotNew.module.scss'
import ErrorComponent from "../../components/ErrorComponent";

type FormData = {
  address: string;
};

type TypeWorkspotNewRequestResponse = {
  message: string,
  workspotName: string
}

const mapContainerStyle = {
  height: "60vh",
  width: "100%",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const WorkspotNewPage = () => {
  const axios = useAxios();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const [center, setCenter] = useState({ lat: 35.1346609, lng: 136.9381131 });
  const { control, handleSubmit, reset } = useForm<FormData>();
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "default",
  });

  const mapRef = useRef<google.maps.Map>();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onSubmit = async () => {
    try {
      const params = {
        lat: mapRef.current?.getCenter()?.lat(),
        lng: mapRef.current?.getCenter()?.lng(),
      };
      const result = await axios.post<TypeWorkspotNewRequestResponse>("workspot/new", params);
      enqueueSnackbar(`${result.data.workspotName}を登録しました`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`登録に失敗しました`, { variant: "error" });
      console.log(err);
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
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: data.address });
      const latlng = {
        lat: result.results[0].geometry.location.lat(),
        lng: result.results[0].geometry.location.lng(),
      };
      setCenter(latlng);
      reset({ address: "" });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout title="ミズホエンジニアリング | 勤務地登録">
      {currentUserIsLoading ? (
        <CircularProgress />
      ) : currentUserIsError ? (
        <ErrorComponent></ErrorComponent>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
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
                  <div className="form">
                    <Controller
                      name="address"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField sx={{ display: "inline-block", width: "20rem" }} fullWidth size="small" label="住所" {...field} />
                      )}
                    />
                    <button className={styles.resetButton} type="submit"><FontAwesomeIcon className={styles.icon} icon={faSearch} size="2x" /></button>
                  </div>
                </form>


                <Box sx={{ margin: "1.5rem 0" }}>
                  <GoogleMap
                    id="map"
                    mapContainerStyle={mapContainerStyle}
                    zoom={14}
                    center={center}
                    options={options}
                    onLoad={onMapLoad}
                    onDragEnd={onDragEnd}
                  >
                    <Circle
                      center={center}
                      radius={1000}
                    />
                    <Marker position={center} />
                  </GoogleMap>
                </Box>
                <Box sx={{ textAlign: "center", marginBottom: "2rem" }}>
                  <Button sx={{ width: "13rem" }} variant="outlined" onClick={async () => onSubmit()}>
                    登録
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )
      }
    </Layout >
  );
};

export default WorkspotNewPage;
