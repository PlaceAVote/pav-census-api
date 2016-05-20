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
 // Work in Progress - Example Response
```
  {
    population: 4815,
    sampleSize: 1623
    votes: {
      yes: 2342,
      no: 108,
      total: 2450
    },
    gender: {
      male: {
        votes: {
          total: 1600,
          yes: 800,
          no: 800,
        },
        ranges: [
          {
            minAge: 18,
            maxAge: 24,
            votes: {
              total: 100,
              yes: 30,
              no: 70,
            }
          }
        ]
      },
      female: {
        votes: {
          total: 850,
          yes: 600,
          no: 250,
        },
        ranges: [
          {
            minAge: 45,
            maxAge: 24,
            votes: {
              total: 100,
              yes: 90,
              no: 10,
            }
          }
        ]
      }
    }
  }
```
