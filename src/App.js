import React, { Component } from 'react';
import './App.css';
import ReactLoading from 'react-loading';
import Graph from './Graph';
import Error from './Error';

class App extends Component {
  constructor() {
    super();
    this.state = {
      urls: [],
      before: '',
      after: '',
      interval: '',
      submitted: false,
      loading: false,
      validInputs: false,
      labels: [],
      values: [],
      urlErrors: false,
      beforeErrors: false,
      afterErrors: false,
      intervalErrors: false,
      formErrors: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.calculateVals = this.calculateVals.bind(this);
    this.validateInput = this.validateInput.bind(this);
  }

  // Function to take the response from API and calculate the values for the Graph
  calculateVals(response) {
    const labels = [];
    const values = [];
    let norm = 0;
    response.map((responseVal) => {
      const temp = [];
      try {
        responseVal.aggregations.by_page_views.buckets.map((bucket) => {
          if (labels.indexOf(bucket.key) < 0) {
            labels.push(bucket.key);
          }
          temp.push(bucket.doc_count);
          return 0;
        });
        values.push(temp);
        return 0;
      } catch (err) {
        temp.push(0);
        values.push(temp);
      }
      return 0;
    });
    values.map((arr) => {
      if (arr.length > 1) {
        norm = arr.length;
      }
      return 0;
    });
    values.map((arr) => {
      if (arr.length === 1) {
        for (let k = 0; k < norm - 1; k += 1) {
          arr.push(0);
        }
      }
      return 0;
    });
    this.setState({ labels });
    this.setState({ values });
    this.setState({ loading: false });
  }
  // Function to take the response from API and calculate the values for the Graph

  // Function to validate timestamp and interval inputs in the form
  validateInput(name, value) {
    if (value != null) {
      switch (name) {
        case 'urls':
          this.state.urls = value.split(',');
          this.setState({ urlErrors: false });
          break;
        case 'before':
          if (value.match(/^[0-9]+$/) || value === '') {
            this.setState({ beforeErrors: false });
          } else {
            this.setState({ beforeErrors: true });
          }
          break;
        case 'after':
          if (value.match(/^[0-9]+$/) || value === '') {
            this.setState({ afterErrors: false });
          } else {
            this.setState({ afterErrors: true });
          }
          break;
        case 'interval':
          if (value.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/) || value === '') {
            this.setState({ intervalErrors: false });
          } else {
            this.setState({ intervalErrors: true });
          }
          break;
        default:
          break;
      }
    }
  }
  // Function to validate timestamp and interval inputs in the form

  // Function to handle change as the user inputs
  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: event.target.value }, () => { this.validateInput(name, value); });
  }
  // Function to handle change as the user inputs


  // Function to validate all inputs and make the API call if the inputs are valid
  handleSubmit(event) {
    const {
      urls,
      before,
      after, interval, beforeErrors, afterErrors, intervalErrors, validInputs, formErrors,
    } = this.state;
    if (urls.length === 0 || before === '' || after === '' || interval === '') {
      this.setState({ formErrors: true });
      if ((urls.length === 1 && urls.shift() === '') || (urls.length === 0)) {
        this.setState({ urlErrors: true });
      } else {
        this.setState({ urlErrors: false });
      }
    } else {
      this.setState({ formErrors: false });
    }
    if (!beforeErrors && !afterErrors && !intervalErrors) {
      this.setState({ validInputs: true });
    } else {
      this.setState({ validInputs: false });
    }
    // Make API call and fetch the response if the inputs are valid
    if (validInputs && !formErrors) {
      this.setState({ submitted: true });
      this.setState({ loading: true });
      event.preventDefault();
      fetch('https://elastictest.herokuapp.com/page_views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          before,
          after,
          interval,
        }),
      }).then((response) => {
        const ret = response.json();
        return ret;
      }).then((response) => {
        this.calculateVals(response);
      });
      // Make API call and fetch the response if the inputs are valid
    } else {
      // Display the error message if the inputs are not valid
      event.preventDefault();
      this.setState({ formErrors: true });
    }
    // Display the error message if the inputs are not valid
  }

  // Function to validate all inputs and make the API call if the inputs are valid
  render() {
    const {
      submitted,
      loading,
      labels,
      values,
      urls,
      formErrors,
      urlErrors,
      beforeErrors,
      afterErrors,
      intervalErrors,
      before,
      after,
      interval,
    } = this.state;

    if (submitted) {
      //  Render loading an  imation if data is still loading but form is submitted
      if (loading) {
        return (
          <div>
            <header className="App-header">
              <h1 className="App-title">Date Histogram Visualisation</h1>
            </header>
            <ReactLoading id="loading" type="balls" color="#000000" height="191px" width="96px" />
          </div>
        );
      }
      // Render graph if data is has loaded

      return (
        <Graph
          labels={labels}
          values={values}
          urls={urls}
        />
      );
    }
    // Render input form if nothing has been submitted
    const errorMessages = [
      'Notice: Please check for errors in the form.',
      'Notice: URL cannot be empty',
      'Notice: Invalid Before Timestamp',
      'Notice: Invalid After Timestamp',
      'Notice: Invalid Interval',
    ];
    const errors = [formErrors, urlErrors, beforeErrors, afterErrors, intervalErrors]
      .map((error, index) => {
        const display = error ? 'block' : 'none';
        return <Error display={display} notice={errorMessages[index]} />;
      });
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Date Histogram Visualisation</h1>
        </header>
        <p className="App-intro">
          Please enter the GET request data below:
        </p>
        {errors}
        <form id="bodyForm" onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <label htmlFor="urls">
            URLS:
            <textarea placeholder="Enter URLs separated by commas..." type="text" name="urls" defaultValue={urls} />
          </label>
          <br />
          <label htmlFor="before">
            Before:
            <input placeholder="Enter milliseconds Timestamp..." type="text" name="before" defaultValue={before} />
          </label>
          <br />
          <label htmlFor="after">
            After:
            <input placeholder="Enter milliseconds Timestamp..." type="text" name="after" defaultValue={after} />
          </label>
          <br />
          <label htmlFor="interval">
            Interval:
            <input placeholder="Enter interval such as 2m or 2s..." type="text" name="interval" defaultValue={interval} />
          </label>
          <br />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default App;
