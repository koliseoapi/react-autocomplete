# React Async Autocomplete

This autocompleter will display options and react to keypress (up, down, enter, esc). Inspired in [React Autocomplete](https://github.com/reactjs/react-autocomplete), but designed for a simplified workflow where requests are expected to be asynchronous (synchronous is supported, but should be less common) and will display a loading icon.

Check the [demo here](http://koliseoapi.github.io/react-async-autocomplete).

## Use

```js
import Autocomplete from "react-async-autocomplete";

// render one item on the list
const MyItemView = function({ item }) {

  return (
    <div className="user-data">
      <div>{item.id}</div>
      <div>{item.name}</div>
    </div>
  );

} 

class MyApp extends React.Component {

  constructor() {
    super();
    this.state = {
      selected: undefined
    }
    this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  // invoked when the user types something. A delay of 200ms is 
  // already provided to avoid DDoS'ing your own servers
  onChange(query) {
    
    // you would normally do here your server access
    fetch('/users/search?q=' + query)
    .then((result) {
      this.refs.autocomplete.setItems(result.body);
    })
  }

  // called when the user clicks an option or hits enter
  onSelect(user) {
    this.setState({
      selectedUser: user
    });
    // the returned value will be inserted into the input field. 
    // Use an empty String to reset the field
    return user.getName();
  }

  render() {
    return (
      <div>
        <Autocomplete 
          ref="autocomplete"
          renderItem={MyItemView} 
          onChange={this.onChange} 
          onSelect={this.onSelect}
        />
      </div>
    )
  }

};
```

## Develop

```bash
npm i

# to develop
npm run watch
```

There is no `build` step. The source is a single file in `lib/index.js`, published "as is".