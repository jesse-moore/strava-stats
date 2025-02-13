import axios from 'axios';
import { GEOCODER_KEY } from '../keys.json';

export const fetchLocationData = async (
    coords:
        | {
              lat: Number;
              lng: Number;
          }
        | undefined
) => {
    if (!coords) return null;
    const { lat, lng } = coords;
    const options = {
        params: {
            lat,
            lon: lng,
            format: 'json',
            'accept-language': 'en',
            polygon_threshold: '0.0',
            zoom: 16,
        },
        headers: {
            'x-rapidapi-key': GEOCODER_KEY,
            'x-rapidapi-host': 'forward-reverse-geocoding.p.rapidapi.com',
        },
    };

    try {
        const response = await axios.get(
            'https://forward-reverse-geocoding.p.rapidapi.com/v1/reverse',
            options
        );
        return response.data;
    } catch (error) {
        throw Error('Failed to Geocode');
    }
};
