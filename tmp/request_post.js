var fs = require("fs");
let axios = require("axios");

const TWITTER_POSTS = "https://api.twitter.com/1.1/statuses/user_timeline.json";

// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/migrate/standard-to-twitter-api-v2
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/migrate/standard-to-twitter-api-v2

//get twitter id by username
//https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username

const username = "masterviana";
const apiKey = "U2SsmyRvrJiDM9pIcnWPFyqbg";
const apiSecret = "MMusMuW6CuJse6GZbjcCqL9Qz1eMzrCYh6ADewASfEyyq8QhZt";

//https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
let requestAuthToken = async function () {
  try {
    axios = require("axios");
    let returnedData = await axios.post(
      "https://api.twitter.com/oauth2/token?grant_type=client_credentials",
      {},
      {
        auth: {
          username: apiKey,
          password: apiSecret,
        },
      }
    );
    if (returnedData.data && returnedData.data.access_token) {
      //console.log("returned data ", returnedData.data.access_token);
      return returnedData.data.access_token;
    } else {
      return {};
    }
  } catch (ex) {
    console.log("Catch request auth token ", ex);
  }
};

let requestUserPosts = async function (access_token) {
  console.log("Request method was called!");

  try {
    axios = require("axios");
    console.log(
      "before request twitter post access token length ",
      access_token,
      " ",
      access_token.length
    );

    let returnedData = await axios.get(
      "https://api.twitter.com/1.1/statuses/user_timeline.json",
      {
        params: {
          screen_name: "masterviana",
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    console.log("returned data : ", returnedData.data);
    //console.log("returned data value ");
  } catch (ex) {
    console.log("AXIOS catch on post request ");
  }
};

const TWITTER_AUTH_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAKgxowEAAAAAswN4kWoUNlHDdfCM5DkmGUKmxPA%3DCZXKOJkel4whETEurJWnGhhhSidZjyHRA9OSvtaWQLzoKcrbCY";

let controller = async function () {
  try {
    const accessToken = await requestAuthToken();
    console.log("access token ", accessToken.toString());
    //let a1 = await requestUserPosts(TWITTER_AUTH_TOKEN);
    //let a1 = await requestUserPosts(accessToken);
  } catch (ex) {}
};

controller();
//requestAuthToken();
