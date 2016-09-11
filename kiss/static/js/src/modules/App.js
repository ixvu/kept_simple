import React from 'react'
import 'script!jquery';
import 'script!jquery.hotkeys'
require('skeleton-css/css/normalize.css')
require('skeleton-css/css/skeleton.css')
require('../../css/app.css')

export default React.createClass({
  getInitialState() {
      return {
          currentIndex : 0,
          records: []
      };
  },
  getLevels(path){
    return path.split(/>/).map( x => x.trim())
  },
  navigateTo(event){
     event.preventDefault();
     let newIndex = parseInt(event.target.attributes['data-new-index'].value);
     this.setIndex(newIndex);
  },
  setIndex(index){
     this.setState({'currentIndex': index});
     this.setMarkings();
  },
  getPrevIndex(){
    let prevIndex = this.state.currentIndex == 0 ? 0 : this.state.currentIndex - 1;
    return prevIndex;
  },
  getNextIndex(){
    let nextIndex = this.state.currentIndex == this.state.records.length -1 ? this.state.currentIndex : this.state.currentIndex + 1;
    return nextIndex;
  },
  renderLevel(level,pos,name,id){
    if (pos == 0){
      return (<li className="top-level" data-cat-level={pos} data-cat-name={name} data-record-id={id} onClick={this.markAsMisclassified} > {level} </li>)
    } else {
      return (<li data-cat-level={pos} data-cat-name={name} data-record-id={id} onClick={this.markAsMisclassified}> {level}  </li>)
    }
  },
  renderPath(path,name,id){
    let levels = this.getLevels(path);
    return (
      <div className="category-block" >
        <h5> {name} </h5>
        <ul>
          { levels.map( (item,pos) => this.renderLevel(item,pos,name,id)) }
        </ul>
        <button className="button" data-cat-name={name} data-record-id={id} onClick={this.markAsCorrectlyClassified} > Correct </button>
      </div>
      );
  },
  setMarkings(category){
    if(category){
      $(".category-block li[data-cat-name="+category+"]").removeClass("error-level");
      $(".category-block button[data-cat-name="+category+"]").removeClass("button-primary")
    }else{
      $(".category-block li").removeClass("error-level");
      $(".category-block button").removeClass("button-primary")
    }
  },
  saveCorrectClassification(id,categoryName){
    //TODO: replace with ajax request
    setTimeout(
      () => console.log("correctly classified:",id, categoryName),1000);

  },
  saveMisclassification(id,categoryName,level){
    //TODO: replace with ajax request
     setTimeout( () => console.log(categoryName,level,id),1000);
  },
  markAsCorrectlyClassified(event){
    let id = event.target.attributes["data-record-id"].value
    let categoryName = event.target.attributes["data-cat-name"].value
    this.setMarkings(categoryName);
    $(event.target).addClass("button-primary");
    this.saveCorrectClassification(id,categoryName);
  },
  markAsMisclassified(event){
    let categoryName = event.target.attributes["data-cat-name"].value
    let errorLevel = event.target.attributes["data-cat-level"].value
    let id = event.target.attributes["data-record-id"].value
    this.setMarkings(categoryName);
    $(event.target).addClass("error-level");
    this.saveMisclassification(id,categoryName,errorLevel);
  },
  componentDidMount() {
    $.get('/feed', {}, (data) => this.setState({records: data, currentIndex: 0}) );
    $(document).bind("keydown", "right", () => this.setIndex(this.getNextIndex()));
    $(document).bind("keydown", "left", () => this.setIndex(this.getPrevIndex()));
    /* binding keys for annotating category 1 */
    $(document).bind("keydown","shift+a",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="0"]').click());
    $(document).bind("keydown","shift+s",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="1"]').click());
    $(document).bind("keydown","shift+d",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="2"]').click());
    $(document).bind("keydown","shift+f",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="3"]').click());
    $(document).bind("keydown","shift+g",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="4"]').click());
    $(document).bind("keydown","shift+h",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="5"]').click());
    $(document).bind("keydown","shift+j",()=>$('.category-block li[data-cat-name="category-1"][data-cat-level="6"]').click());
    $(document).bind("keydown","shift+z",()=>$('.category-block button[data-cat-name="category-1"]').click());
    /* binding keys for annotating category 2 */
    $(document).bind("keydown","shift+q",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="0"]').click());
    $(document).bind("keydown","shift+w",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="1"]').click());
    $(document).bind("keydown","shift+e",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="2"]').click());
    $(document).bind("keydown","shift+r",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="3"]').click());
    $(document).bind("keydown","shift+t",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="4"]').click());
    $(document).bind("keydown","shift+y",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="5"]').click());
    $(document).bind("keydown","shift+u",()=>$('.category-block li[data-cat-name="category-2"][data-cat-level="6"]').click());
    $(document).bind("keydown","shift+x",()=>$('.category-block button[data-cat-name="category-2"]').click());
  },
  render() {
    let item = this.state.records.length > 0 ? this.state.records[this.state.currentIndex] : null;
    if (item){
      let amazonSearchLink = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords="+item.title
      let prevIndex = this.getPrevIndex()
      let nextIndex = this.getNextIndex();
      let category_1 = item.categorypath1;
      let category_2 = item.categorypath2;
      return (
      <div className="container">
          <div className="row">
              <div className="one column u-pull-left">
                  <a href={"/prev/"+prevIndex} data-new-index={prevIndex} onClick={this.navigateTo}> previous </a>
              </div>
              <div className="one column u-pull-right">
                  <a href={"/next/"+nextIndex} data-new-index={nextIndex} onClick={this.navigateTo}> next </a>
              </div>
          </div>
          <div className="row">
             <ul className='no-list-style help-links'>
                  <li> <a href={item.url} target="_blank"> open in browser </a> </li>
                  <li> <a href={amazonSearchLink} target="_blank"> search in amazon </a> </li>
             </ul>
          </div>
          <div className="row">
            <div className="eight columns">
              <h5> {item.title} </h5>
              <img className="u-full-width" src="static/sample3.png"/>
            </div>
            <div className="two columns">
              {/* TODO: change the currentIndex  to db / pentos_id */}
              { this.renderPath(category_1,"category-1",this.state.currentIndex)}
            </div>
            <div className="two columns">
              { this.renderPath(category_2,"category-2",this.state.currentIndex)}
            </div>
          </div>
      </div>
      )
    } else {
      return <h4> Loading ....</h4> ;
    };
  }
})