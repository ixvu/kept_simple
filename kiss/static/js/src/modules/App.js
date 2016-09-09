import React from 'react'
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
  render() {
  	let item = this.props.records[this.state.current_index]
  	let amazon_search_link = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords="+item.title
  	let prev_index = this.state.current_index == 0 ? 0 : this.state.current_index - 1;
  	let next_index = this.state.current_index == this.props.records.length -1 ? this.state.current_index : this.state.current_index + 1;
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
	        	<div className="category-block">
		        	<ul>
		        		<li className="top-level"> Sports & Outdoors </li>
		        		<li> Fan Shop </li>
		        		<li> Clothing & Accessories </li>
		        		<li> Sweatshirts </li>
		        		<li className="error-level"> Kids </li>
		        		<li> Boys </li>
		        	</ul>
	        	</div>
        	</div>
        	<div className="two columns">
	        	<div className="category-block">
		        	<ul>
		        		<li className="top-level"> Sports & Outdoors </li>
		        		<li> Fan Shop </li>
		        		<li> Clothing & Accessories </li>
		        		<li className="error-level"> Sweatshirts </li>
		        		<li> Kids </li>
		        		<li> Boys </li>
		        	</ul>
		        </div>
        	</div>
        </div>
    </div>
    )
  }
})