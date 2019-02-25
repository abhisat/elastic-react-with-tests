import React from 'react';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow, mount, sinonwq } from 'enzyme';
import toJson from 'enzyme-to-json';
import canvas from 'canvas';
import jest from 'jest';
import sinon from 'sinon';
import App from './App';
import Error from './Error';
import Graph from './Graph';

// Configure Enzyme Adapter
Enzyme.configure({
  adapter: new EnzymeAdapter(),
});

// Setup App Component proper mount
const setupMountApp = (props = {}, state = {}) => {
  const wrapper = mount(<App {...props} />);
  if (state) wrapper.setState({ ...state });
  return wrapper;
};

// Setup App Component shallow mount
const setupApp = (props = {}, state = {}) => {
  const wrapper = shallow(<App {...props} />);
  if (state) wrapper.setState({ ...state });
  return wrapper;
};

// Setup Graph Component proper mount
const setupMountGraph = (props = {}, state = {}) => {
  const wrapper = mount(<Graph {...props} />);
  if (state) wrapper.setState({ ...state });
  return wrapper;
};

// Setup Graph component shallow mount
const setupGraph = (props = {}, state = {}) => {
  const wrapper = shallow(<Graph {...props} />);
  if (state) wrapper.setState({ ...state });
  return wrapper;
};

// Setup Errors components
const setupErrors = (props = {}) => {
  const wrapper = shallow(<Error {...props} />);
  return wrapper;
};

// Unit Tests to check if the components mount
describe('App components mounts', () => {
  it('App Renders', () => {
    setupApp();
  });

  it('Renders the main div', () => {
    const wrapper = setupMountApp();
    expect(wrapper.find('div').exists()).toBe(true);
    wrapper.unmount();
  });

  it('Graph component mounts', () => {
    const props = {};
    const wrapper = setupMountGraph(props);
    it('Should render the graph with props', () => {
      expect(wrapper.find(Graph).length).toBe(1);
    });
    wrapper.unmount();
  });
});

// Unit tests to check if the individual components render correctly
describe('The components render correctly', () => {
  const wrapper = setupApp();
  describe('The header renders correctly', () => {
    it('Renders the Header text', () => {
      expect(wrapper.find('h1').text()).toBe('Date Histogram Visualisation');
    });

    it('Renders the app introduction', () => {
      expect(wrapper.find('.App-intro').exists()).toBe(true);
    });
  });

  describe('The form renders correctly', () => {
    describe('Renders the form inputs', () => {
      it('Renders the submit button', () => {
        expect(wrapper.find('#submit').exists()).toBe(true);
      });

      it('Renders the URL textarea', () => {
        expect(wrapper.find('#urls').exists()).toBe(true);
      });

      it('Renders the before timestamp textinput', () => {
        expect(wrapper.find('#before').exists()).toBe(true);
      });

      it('Renders the after timestamp textinput', () => {
        expect(wrapper.find('#after').exists()).toBe(true);
      });

      it('Renders the intervals textinput', () => {
        expect(wrapper.find('#interval').exists()).toBe(true);
      });
    });

    describe('Renders the form labels', () => {
      it('Renders the url label', () => {
        expect(wrapper.find('#urlsLabel').exists()).toBe(true);
      });

      it('Renders the before label', () => {
        expect(wrapper.find('#beforeLabel').exists()).toBe(true);
      });

      it('Renders the after label', () => {
        expect(wrapper.find('#afterLabel').exists()).toBe(true);
      });

      it('Renders the interval label', () => {
        expect(wrapper.find('#intervalLabel').exists()).toBe(true);
      });
    });
// The errors are not rendered in the initial render
    describe('Does not render the errors on the first mount', () => {
      it('No error messages rendered', () => {
        expect(wrapper.find('#error').exists()).toBe(false);
      });
    });
  });
});

// Unit tests to check the form validation
describe('Validation Errors display', () => {
  const props = {};
  describe('URL error renders correctly', () => {
    const wrapper = setupApp();
    wrapper.setState({ urlErrors: true }, () => {
      props.key = 'urlErrors';
      props.display = wrapper.state.urlErrors ? 'block' : 'none';
      props.notice = 'Notice: URL cannot be empty';
    });
    wrapper.update();

    it('renders the correct number of errors', () => {
      expect(wrapper.find(Error).length).toEqual(1);
    });
  });

  describe('Before timestamp error renders correctly', () => {
    const wrapper = setupApp();
    wrapper.setState({ beforeErrors: true }, () => {
      props.key = 'beforeErrors';
      props.display = wrapper.state.beforeErrors ? 'block' : 'none';
      props.notice = 'Notice: Invalid Before Timestamp';
    });
    wrapper.update();

    it('renders the correct number of errors', () => {
      expect(wrapper.find(Error).length).toEqual(1);
    });

    it('renders the correct error text', () => {
      expect(wrapper.find(Error).shallow().text()).toBe('Notice: Invalid Before Timestamp');
    });
  });
});

// Tests whether the error component is stateless
describe('Tests if the Error component is stateless', () => {
  const props = {
    key: 0,
    display: 'block',
    notice: 'Notice: URL cannot be empty',
  };
  const wrapper = setupErrors(props);
  const instance = wrapper.instance();

  it('should return null', () => {
    expect(instance).toBe(null);
  });
});

// Unit Tests whether the validateInput functions correctly
describe('Test validateInput function', () => {
  const props = {};
  const state = {
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
  const wrapper = setupApp(props, state);
  const instance = wrapper.instance();
  describe('validates urls', () => {
    it('tests whether urlErrors state remains unchanged on valid input', () => {
      const name = 'urls';
      const value = 'www.google.com,www.facebook.com,www.yahoo.com,www.bauer-media.com.au';
      expect(wrapper.state('urlErrors')).toBe(false);
      wrapper.setState({ urls: value.split(',') });
      instance.validateInput(name, value);
      expect(wrapper.state('urlErrors')).toBe(false);
    });

    it('tests whether urlsErrors state changes on invalid input', () => {
      const name = 'urls';
      const value = '';
      expect(wrapper.state('urlErrors')).toBe(false);
      wrapper.setState({ urls: value.split(',') });
      instance.validateInput(name, value);
      expect(wrapper.state('urlErrors')).toBe(true);
    });
  });

  describe('validates before timestamp', () => {
    it('tests whether beforeErrors state changes valid input', () => {
      const name = 'before';
      const value = '1554984732';
      expect(wrapper.state('beforeErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('beforeErrors')).toBe(false);
    });

    it('tests whether beforeErrors state changes on no input', () => {
      const name = 'before';
      const value = '';
      expect(wrapper.state('beforeErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('beforeErrors')).toBe(false);
    });

    it('tests whether beforeErrors state changes on invalid input', () => {
      const name = 'before';
      const value = 'bvdfjksbvksdbvs';
      expect(wrapper.state('beforeErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('beforeErrors')).toBe(true);
    });
  });

  describe('validates after timestamp', () => {
    it('tests whether beforeErrors state changes valid input', () => {
      const name = 'after';
      const value = '1554984745';
      expect(wrapper.state('afterErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('afterErrors')).toBe(false);
    });

    it('tests whether beforeErrors state changes on no input', () => {
      const name = 'after';
      const value = '';
      expect(wrapper.state('afterErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('afterErrors')).toBe(false);
    });

    it('tests whether beforeErrors state changes on invalid input', () => {
      const name = 'after';
      const value = 'dgcjkdsbvdsv';
      expect(wrapper.state('afterErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('afterErrors')).toBe(true);
    });
  });

  describe('validates intervals input', () => {
    it('tests whether intervalErrors state changes on valid input', () => {
      const name = 'interval';
      const value = '2s';
      expect(wrapper.state('intervalErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('intervalErrors')).toBe(false);
    });

    it('tests whether intervalErrors state changes on no input', () => {
      const name = 'interval';
      const value = '';
      expect(wrapper.state('intervalErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('intervalErrors')).toBe(false);
    });

    it('tests whether intervalErrors state changes on invalid input', () => {
      const name = 'interval';
      const value = 'dvsdvsdvsd';
      expect(wrapper.state('intervalErrors')).toBe(false);
      instance.validateInput(name, value);
      expect(wrapper.state('intervalErrors')).toBe(true);
    });
  });
});

describe('Tests behaviour on submit', () => {
  describe('Submit empty form', () => {
    const props = {};
    const state = {
      urls: [],
      before: '',
      after: '',
      interval: '',
    };
    const wrapper = setupApp(props, state);
    it('should render the error messages for form error and url', () => {
      wrapper.find('form').simulate('submit', {
        preventDefault: () => {
        },
      });
      wrapper.update();
      expect(wrapper.find(Error).length).toEqual(2);
    });
  });

  describe('Submit form with missing inputs', () => {
    const props = {};
    const state = {
      urls: ['www.google.com', 'www.facebook.com'],
      before: '',
      after: '',
      interval: '2s',
    };
    const wrapper = setupApp(props, state);
    it('should render the error messages for form error and url', () => {
      wrapper.find('form').simulate('submit', {
        preventDefault: () => {
        },
      });
      expect(wrapper.find(Error).length).toEqual(1);
    });
  });

  describe('submit form with proper inputs', () => {
    const props = {};
    const state = {
      urls: ['www.google.com', 'www.facebook.com'],
      before: '1551083904',
      after: '1551084478',
      interval: '2s',
    };
    const wrapper = setupMountApp(props, state);
    it('should render the graph component', () => {
      wrapper.find('form').simulate('submit', {
        preventDefault: () => {
        },
      });
      expect(wrapper.find(Graph).length).toEqual(1);
      wrapper.unmount();
    });
  });
});

describe('Test calculateVals function', () => {
  const response = [];
  const props = {};
  const state = {
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
  const wrapper = setupApp(props, state);
  const instance = wrapper.instance();

  expect(wrapper.state('labels')).toEqual([]);
  expect(wrapper.state('values')).toEqual([]);
  instance.calculateVals(response);
  expect(wrapper.state('labels')).toEqual([]);
  expect(wrapper.state('values')).toEqual([]);
});

// Tests Event Handlers
describe('The event handlers work properly', () => {
  describe('calls handleSubmit', () => {
    const wrapper = setupApp();
    const handleSubmit = sinon.spy(wrapper.instance(), 'handleSubmit');
    wrapper.instance.forceUpdate();
    wrapper.update();
    wrapper.find('form').simulate('submit', {
      preventDefault: () => {
      },
    });
    sinon.assert.calledOnce(handleSubmit);
  });

  describe('calls handleChange', () => {
    const wrapper = setupApp();
    const handleChange = sinon.spy(wrapper.instance(), 'handleChange');
    wrapper.instance.forceUpdate();
    wrapper.update();
    wrapper.find('#urls').simulate('keydown', {
      which: 'a',
      preventDefault: () => {
      },
    });
    sinon.assert.calledOnce(handleChange);
  });
});

// Snapshot tests for comprehensive component comparision
describe('Component snapshots', () => {
  describe('App component snapshot', () => {
    it('should render correctly', () => {
      const wrapper = setupApp();
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('Graph component snapshot', () => {
    it('should render correctly', () => {
      const wrapper = setupGraph();
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('Error components mount', () => {
    it('should render correctly', () => {
      const props = {
        key: 0,
        display: 'block',
        notice: 'Notice: URL cannot be empty',
      };
      const wrapper = setupApp(props);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });
});
