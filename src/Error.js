import React from 'react';
import PropTypes from 'prop-types';

function Error(props) {
  const { display, notice } = props;
  const style = {
    display,
  };
  return (
    <p id="error" style={style}>{notice}</p>
  );
}

Error.propTypes = {
  display: PropTypes.string,
  notice: PropTypes.string,
};

Error.defaultProps = {
  display: 'none',
  notice: 'Error',
};
export default Error;
