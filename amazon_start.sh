#!/usr/bin/env bash

docker pull mordhau/eth-web
docker pull mordhau/eth-data
docker pull mordhau/ethereum-geth-dev

docker-compose -f docker-aws.yml up -d

exit 1