import cube from "@cubejs-client/core";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const cubeApi = cube(API_KEY, { apiUrl: API_URL });

export default cubeApi;
