# google-actions-rpsls
Repository for the articles on building an app with Google Home.

First Article - [Creating a Google Home App](https://agingcoder.com/programming/2018/02/04/creating-a-google-home-app/) 


Update Actions.json
===================

Download gactions cli from [https://developers.google.com/actions/tools/gactions-cli](https://developers.google.com/actions/tools/gactions-cli)

```gactions update --action_package rpsls.json --project rpsls-XXXXX```

Start NGrok
===========

```ngrok http 5050```

Ensure "url": "https://2a992c24.ngrok.io" in matches the value being forwarded (ngrok creates a unique ID after each time it is restarted)

