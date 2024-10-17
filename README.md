# useFetch

Manage the error, loading and data state of `fetch`

See example use [here](./use-fetch.example.tsx)

## Requirements

- [ ] Accepts:
  - [ ] a generic type argument
    - [ ] returned data is typed as T
  - [ ] a url string
  - [ ] request options (optional)
    - [ ] options to pass to fetch
  - [ ] options (optional)
    - [ ] immediate - defaults to true
- [ ] Returns:
  - [ ] a loading boolean
  - [ ] an error that can be a string or null
  - [ ] a data property that can be type T or null
  - [ ] a load function
    - [ ] can be called to fetch or re-fetch the data
  - [ ] updateUrl
    - [ ] can be called to update the url and re-fetch
  - [ ] updateRequestOptions
    - [ ] can be called to update the request options and re-fetch
  - [ ] updateOptions
    - [ ] can be called to update options
- [ ] Behavior:
  - [ ] Error handling
    - [ ] If the request fails due to http status (response.ok)
  - [ ] Should fetch on mount if `options.immediate` is true
  - [ ] Should set loading when fetching data
  - [ ] Error handling
    - [ ] If the request fails due to fetch error (e.g. Network Error)
    - [ ] If the request fails due to http status (response.ok)
    - [ ] If the json parse fails
    - [ ] If any error occurs:
      - [ ] Set the error message
      - [ ] Set data to null
      - [ ] Set loading to false
  - [ ] Should re-fetch if the url changes
  - [ ] Should re-fetch if the request options change
  - [ ] Should re-fetch if the options change and immediate is true
  - [ ] Should re-fetch if load function is called
  - [ ] Should cancel any in progress requests if a new request is made
  - [ ] Should only set the data to be the latest request that was made
  - [ ] Should cancel any in progress requests if unmounted
