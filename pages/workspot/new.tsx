import React, { useCallback, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { Button, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import useAxios from "../../hooks/useAxios";
import useCurrentUser from "../../hooks/useCurrentUser";
import Layout from "../../components/Layout";
import { accessTokenState } from "../../components/atoms";
import { useRecoilValue } from "recoil";
import router from "next/router";

type FormData = {
  address: string;
};

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
      await axios.post("workspot/new", params);
      alert("insert Success");
    } catch (err) {
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
    <Layout title="ミズホエンジニアリング | サインアップ">
      {currentUserIsLoading ? (
        <div>loading</div>
      ) : currentUserIsError ? (
        <div>error</div>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
      ) : (
        <>
          <div>勤務地登録</div>
          {!isLoaded ? (
            "loading"
          ) : loadError ? (
            "error"
          ) : (
            <div>
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
                  // optional
                  center={center}
                  radius={1000}
                />
                <Marker position={center} />
              </GoogleMap>
              <div>
                <Button variant="outlined" onClick={async () => onSubmit()}>
                  登録
                </Button>
                <form onSubmit={handleSubmit(onSearch)}>
                  <div className="form">
                    <Controller
                      name="address"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField label="address" {...field} />
                      )}
                    />
                  </div>
                  <Button type="submit" variant="outlined">
                    Search
                  </Button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default WorkspotNewPage;
