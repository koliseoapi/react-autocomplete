/*

  Autocomplete component.

  suggestView.setItems(items: Array()) to display menu.

  Properties: see at the end of the file

*/
import ReactDOM from 'react-dom';
import React from 'react';
import { bindAll, throttle, extend } from 'lodash';
import scrollIntoView from 'dom-scroll-into-view';

class Autocomplete extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      // true to show the options, false otherwise
      isOpen: false,

      // true to show the loading indicator
      loading: false,

      // the options to display
      items: [],

      // the index of the highlighted option
      index: -1
    };
    this.keyDownHandlers = {
      ArrowDown (event) {
        if (!this.state.isOpen && this.state.items.length) {
          this.setState({
            isOpen: true
          });
        } else {
          this.moveSelectedOption(1);
        }
      },

      ArrowUp (event) {
        this.moveSelectedOption(-1);
      },

      Enter (event) {
        var { isOpen, index } = this.state;
        if (isOpen && index > -1) {
          this.onSelectIndex(index);
        }
      },

      Escape (event) {
        this.hideItems();
      }
    }

    bindAll(this, [ 'hideItems', 'onSelectIndex', 'onKeyDown', 'onMouseEnterItem', 'onClickItem' ])
    this.onChangeInput = throttle(function() {
      this.setState({
        loading: true
      });
      this.props.onChange(ReactDOM.findDOMNode(this.refs.input).value);
    }.bind(this), 200, {leading: false});

  }

  setItems(items) {
    this.setState({ 
      isOpen: true,
      loading: false,
      items: items,
      index: items.length? 0 : -1
    })
  }

  hideItems() {
    this.setState({
      isOpen: false,
      loading: false
    });
  }

  componentWillUpdate(nextProps, { isOpen }) {
    const prevIsOpen = this.state.isOpen;
    if (prevIsOpen && !isOpen) {
      document.removeEventListener('click', this.hideItems);
    } else if (!prevIsOpen && isOpen) {
      document.addEventListener("click", this.hideItems);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen === true) {
      const selected = document.getElementsByClassName('autocomplete-li selected');
      if (selected.length) {
        scrollIntoView(selected[0], 
          selected[0].parentElement, 
          { onlyScrollIfNeeded: true }
        );
      }
    }
  }

  onMouseEnterItem(e) {
    const _index = +e.currentTarget.getAttribute('data-index');
    this.setState({
      index: _index
    })
  }

  onClickItem(e) {
    var _index = +e.currentTarget.getAttribute('data-index');
    this.onSelectIndex(_index);
  }

  onSelectIndex(index) {
    var item = this.state.items[index];
    var newInputValue = this.props.onSelect(item);
    var $input = this.refs.input;
    this.hideItems();
    $input.value = newInputValue || '';
    newInputValue && $input.select(); 
  }

  onKeyDown (event) {
    const handler = this.keyDownHandlers[event.key];
    if (handler) {
      event.preventDefault();
      handler.call(this, event);
    }
  }

  // select the next or previous option
  // @param delta +1 or -1 to move to the next or previous choice
  moveSelectedOption(delta) {
    var { index, items } = this.state
    if (!items.length) {
      index = -1;
    } else {
      var index = ((index || 0) + delta) % items.length;
      if (index < 0) {
        index = 0;
      }
    }
    this.setState({
      index: index,
      isOpen: true,
    })

  }

  renderItems() {
    const { items, index, isOpen } = this.state;
    const $empty = items && items.length? undefined : 
      <div className="autocomplete-li empty">{this.props.emptyMessage}</div>;
    return !isOpen? undefined : (
      <div className="autocomplete-list">
        { $empty || items.map((item, _index) => {
          return (
            <div 
              className={"autocomplete-li" + (index == _index? ' selected' : '')} 
              key={_index} 
              onClick={this.onClickItem} 
              data-index={_index}
              onMouseEnter={this.onMouseEnterItem}
            >
              <this.props.ItemView item={item} highlighted={index == _index}/>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className="autocomplete">
        <input 
          type="text" 
          ref="input" 
          className="autocomplete-input"
          autocomplete="off"
          aria-autocomplete="list"
          {... this.props.inputProps}
          onChange={this.onChangeInput} 
          onKeyDown={this.onKeyDown}
        />
        { this.renderItems() }
        { this.state.loading? <div className="loading"></div> : undefined }
      </div>
    )
  }
};

const types = React.PropTypes;
Autocomplete.propTypes = {

  // Render each item. Receives props: item and highlighted
  ItemView: types.oneOfType([
      types.element, types.func
    ]).isRequired,

  // invoked when there is a change in the input field. Should go to server
  // (probably using Promises) and invoke setItems when response is received. 
  onChange: types.func.isRequired,

  // invoked when the user has selected an item. Receives the selected item
  // returns the test to put on the input field. Any extra text will be selected
  onSelect: types.func.isRequired,

  // message when there are no results
  emptyMessage: types.string
}

Autocomplete.defaultProps = {
  emptyMessage: 'No results found'
};

export default Autocomplete;