import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import Tflite from 'tflite-react-native';
import Images from './themes/Images';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const Home = () => {
  let tflite = new Tflite();
  const [image, setImage] = useState();
  const [data, setData] = useState();

  tflite.loadModel(
    {
      model: 'models/model_unquant.tflite', // required
      labels: 'models/labels.txt', // required
      numThreads: 1, // defaults to 1
    },
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log('res', res);
      }
    },
  );

  const selectImage = () => {
    const options = {
      title: 'Select Avatar',
      customButtons: [{name: 'fb', title: 'Choose Photo from Facebook'}],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('user cancel');
      } else if (response.errorCode) {
        console.log('errorCode');
      } else {
        setImage(response.assets?.[0]?.uri);
        console.log('selectImage ~ response.assets', response.assets);
        tflite.runModelOnImage(
          {
            path: response.assets?.[0]?.uri, // required
            imageMean: 128.0, // defaults to 127.5
            imageStd: 128.0, // defaults to 127.5
            numResults: 3, // defaults to 5
            threshold: 0.05, // defaults to 0.1
          },
          (err, res) => {
            if (err) {
              console.log('Home ~ err', err);
            } else {
              console.log('Home ~ res', res);
              setData(res);
            }
          },
        );
      }
    });
  };

  return (
    <SafeAreaView
      style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <Text>Detect corgi</Text>
      <TouchableOpacity
        style={{
          margin: 15,
          padding: 10,
          backgroundColor: 'pink',
          borderRadius: 4,
        }}
        onPress={selectImage}>
        <Text>Choose Image</Text>
      </TouchableOpacity>
      {image && (
        <Image
          resizeMode="center"
          source={{uri: image}}
          style={{width: 100, height: 100}}
        />
      )}
      {data && <Text>{`Result: ${data?.[0]?.label}`}</Text>}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
