#!/usr/bin/env bash

docker tag eth_web mordhau/eth-web
docker tag eth_data mordhau/eth-data
docker push mordhau/eth-web
docker push mordhau/eth-data
exit 1