## PlaceAVote Census API

A Node Api to expose census data

#### Endpoints

##### Bill Census Data:

_Request_

```
  /bill?billId={billId}&state={state}&district={district}
```

**Path**

```
  /bill
```

**QueryParams**

  * billId
  * state
  * district

_Response_
 // Work in Progress (Currently will only return population)
```
  {
    population: 4815,
    sampleSize: 1623,
    voteCount:  421,
  }
```
