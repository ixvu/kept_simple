import React from 'react'
import 'script!jquery';
require('skeleton-css/css/normalize.css')
require('skeleton-css/css/skeleton.css')
require('../../css/app.css')


var diff = require('json!../diff.json');

export default React.createClass({
  getInitialState() {
      return {
          'current_index' : 0  
      };
  },
  getDefaultProps() {
      return {
          'records' : diff
      };
  },
  getLevels(path){
  	return path.split(/>/).map( x => x.trim())
  },
  navigateTo(event){
  	 event.preventDefault()
  	 let new_index = parseInt(event.target.attributes['data-new-index'].value)
  	 this.setState({'current_index': new_index})
  },
  renderLevel(level, pos){
		if (pos == 0){
			return (<li className="top-level" data-cat-level={pos} onClick={this.markAsMisclassified} > {level} </li>)
		} else {
			return (<li data-cat-level={pos} onClick={this.markAsMisclassified}> {level}  </li>)
		}
  },
  renderPath(path,name){
  	let levels = this.getLevels(path);
  	return (
  		<div className="category-block" data-cat-name={name}>
  			<ul>
  				{ levels.map(this.renderLevel) }
  			</ul>
  		</div>
  		);
  },
  markAsMisclassified(event){
  	$(".category-block li").removeClass("error-level")
  	$(event.target).addClass("error-level")
  },
  render() {
  	let item = this.props.records[this.state.current_index]
  	let amazon_search_link = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords="+item.title
  	let prev_index = this.state.current_index == 0 ? 0 : this.state.current_index - 1;
  	let next_index = this.state.current_index == this.props.records.length -1 ? this.state.current_index : this.state.current_index + 1;
  	let category_1 = item.category_1
  	let category_2 = item.category_2
    return (
    <div className="container">
        <div className="row">
            <div className="one column u-pull-left">
                <a href={"/prev/"+prev_index} data-new-index={prev_index} onClick={this.navigateTo}> previous </a>
            </div>
            <div className="one column u-pull-right">
                <a href={"/next/"+next_index} data-new-index={next_index} onClick={this.navigateTo}> next </a>
            </div>
        </div>
        <div className="row">
           <ul className='no-list-style help-links'>
                <li> <a href={amazon_search_link} target="_blank"> search in amazon </a> </li>
                <li> <a href={item.url} target="_blank"> open in browser </a> </li>
           </ul>
        </div>
        <div className="row">
        	<div className="eight columns">
        		<h4> {item.title} </h4>
		        <img className="u-full-width" src="static/sample3.png"/>
        	</div>
        	<div className="two columns">
        		{ this.renderPath(category_1,"category-1")}
        	</div>
        	<div className="two columns">
        		{ this.renderPath(category_2,"category-2")}
        	</div>
        </div>
    </div>
    )
  }
})