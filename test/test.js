import Autocomplete from "../lib/main";
import ReactDOM from "react-dom";
import React from "react";
import PokemonClassnames from './pokemon-classnames';

// transforms pkmn-bulbasaur-shiny to Bulbasaur Shiny
class PokemonModel {

  constructor(cssClassName) {
    this.cssClassName = cssClassName;
    this.name = cssClassName
      .replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); })
      .replace('pkmn ', '');
  }
}

// render one pokemon 
const PokemonItemView = function({ item }) {

  return (
    <div className="pokemon-container">
      <div className={'pkspr ' + item.cssClassName}><i/></div>
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

  onChange(query) {
    
    // you would normally do here your server access
    // we are delaying 1 second to see the spinner, because it's beautiful
    this.delayed && clearTimeout(this.delayed);
    this.delayed = setTimeout(() => {
      this.delayed = null;
      Promise.resolve().then(() => {
        query = query.toLowerCase();
        const filteredPokemon = PokemonClassnames.filter(function(cssClassName) {
          // ignore the 'pkmn-' prefix 
          return cssClassName.indexOf(query, 5) != -1;
        }).map(function(cssClassName) {
          return new PokemonModel(cssClassName)
        })
        this.refs.autocomplete.setItems(filteredPokemon);
      });
    }, 1000)
  }

  onSelect(item) {
    this.setState({
      selected: item
    });
    return item.cssClassName.replace('pkmn-', '');
  }

  render() {
    var selected = this.state.selected;
    return (
      <div>
        <Autocomplete 
          ref="autocomplete"
          renderItem={PokemonItemView} 
          onChange={this.onChange} 
          onSelect={this.onSelect}
        />
        { !selected? undefined :
          <div>
            <hr/>
            <h3>Selected Pokemon</h3>
            <PokemonItemView item={selected} />
          </div>
        }
      </div>
    )
  }

};

ReactDOM.render(<MyApp/>, document.getElementsByClassName('autocomplete-container')[0]
);
