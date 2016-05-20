## PlaceAVote Census API

[![CircleCI](https://circleci.com/gh/PlaceAVote/pav-census-api.svg?style=svg&circle-token=76a66e65cd52cd181acc467479cb7da008044fcf)](https://circleci.com/gh/PlaceAVote/pav-census-api)

A Node Api to expose demographic data

---

#### Endpoints

---

##### Health:

_Request_

```
  /health
```

_Response_
```
  200
```

---

##### Demographic Data For a Bill:

_Request_

```
  /demographic?billId={billId}&state={state}&district={district}
```

**Path**

```
  /demographic
```

**QueryParams**

  * billId
  * state
  * district

_Response_
 // Work in Progress
```
  {
    population: 4815,
    votes: {
      yes: 2342,
      no: 108,
      total: 2450
    },
    gender: {
      male: {
        total: 1600,
        // age range tbc.
      },
      female: {
        total: 850,
        // age range tbc.
      }
    }
    sampleSize: 1623
  }
```
