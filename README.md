### PlaceAVote Census API
A Node Api to expose demographic data

---

<p align="center">
  <img src="https://circleci.com/gh/PlaceAVote/pav-census-api.svg?style=svg&circle-token=76a66e65cd52cd181acc467479cb7da008044fcf" ahref="https://circleci.com/gh/PlaceAVote/pav-census-api"/>
  <img src="https://img.shields.io/circleci/token/76a66e65cd52cd181acc467479cb7da008044fcf/project/BrightFlair/PHP.Gt/master.svg" ahref="https://circleci.com/gh/PlaceAVote/pav-census-api"/>
<img src="https://img.shields.io/codecov/c/token/J2EeBYiC64/github/PlaceAVote/pav-census-api/master.svg?style=flat" ahref"https://codecov.io/github/PlaceAVote/pav-census-api?branch=master" />
</p>


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
            maxAge: 60,
            votes: {
              total: 100,
              yes: 90,
              no: 10,
            }
          }
        ]
      },
      nonBinary: {
        votes: {
          total: 0,
          yes: 0,
          no: 0,
        },
        ranges: [
          {
            minAge: 0,
            maxAge: 0,
            votes: {
              total: 0,
              yes: 0,
              no: 0,
            }
          }
        ]
      },
    }
  }
```
