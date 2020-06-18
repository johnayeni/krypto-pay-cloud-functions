firebase functions:config:set env="$(cat env.json)"

firebase deploy --only functions

firebase deploy --only firestore:rules