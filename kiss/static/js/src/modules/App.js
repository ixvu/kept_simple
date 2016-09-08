import React from 'react'
require('skeleton-css/css/normalize.css')
require('skeleton-css/css/skeleton.css')
require('../../css/app.css')

export default React.createClass({
  render() {
    return (
    <div className="container">
        <div className="row">
            <div className="one column u-pull-left">
                <a href="/prev"> previous </a>
            </div>
            <div className="one column u-pull-right">
                <a href="/prev"> next </a>
            </div>
        </div>
        <div className="row">
           <ul className='no-list-style help-links'>
                <li> <a href="/amazon"> open in amazon </a> </li>
                <li> <a href="/browser"> open in browser </a> </li>
           </ul>
        </div>
        <div className="row">
        	<div className="eight columns">
		        <img className="u-full-width" src="static/sample3.png"/>
        	</div>
        	<div className="two columns">
	        	<div className="category-block">
		        	<ul>
		        		<li className="top-level"> Sports & Outdoors </li>
		        		<li> Fan Shop </li>
		        		<li> Clothing & Accessories </li>
		        		<li> Sweatshirts </li>
		        		<li> Kids </li>
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
		        		<li> Sweatshirts </li>
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