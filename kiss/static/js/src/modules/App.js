import React from 'react';
import 'script!jquery';
import 'script!jquery.hotkeys';
require('skeleton-css/css/normalize.css');
require('skeleton-css/css/skeleton.css');
require('../../css/app.css');
var update = require('react-addons-update');

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
     this.getAnnotations(this.state.records[index].id);
  },
  getPrevIndex(){
    let prevIndex = this.state.currentIndex == 0 ? 0 : this.state.currentIndex - 1;
    return prevIndex;
  },
  getNextIndex(){
    let nextIndex = this.state.currentIndex == this.state.records.length -1 ? this.state.currentIndex : this.state.currentIndex + 1;
    return nextIndex;
  },
  renderLevel(level,pos,name,id,categoryId){
    if (pos == 0){
      return (<li className="top-level" data-cat-level={pos} data-record-id={id} data-category-id={categoryId} onClick={this.annotate} > {level} </li>)
    } else {
      return (<li data-cat-level={pos} data-record-id={id} data-record-id={id} data-category-id={categoryId} onClick={this.annotate}> {level}  </li>)
    }
  },
  renderPath(path,name,id,categoryId){
    let levels = this.getLevels(path);
    return (
      <div className="category-block" >
        <h5> {name} </h5>
        <ul>
          { levels.map( (item,pos) => this.renderLevel(item,pos,name,id,categoryId)) }
        </ul>
        <button className="button" data-record-id={id} data-category-id={categoryId} onClick={this.annotate} > Correct </button>
      </div>
      );
  },
  resetMarkings(category){
    if(category){
      $(".category-block li[data-category-id="+category+"]").removeClass("error-level");
      $(".category-block button[data-category-id="+category+"]").removeClass("button-primary")
    }else{
      $(".category-block li").removeClass("error-level");
      $(".category-block button").removeClass("button-primary")
    }
  },
  saveAnnotation(recordId,categoryId,level){
    //TODO: replace with ajax request
     let data = {
     			record_id: recordId,
     			category_path_id: categoryId,
     			annotation_id:level
     		};

     $.post('/annotate', data , () => console.log("Saved successfully",data));
  },
  annotate(event){
    let categoryId = event.target.attributes["data-category-id"].value;
    let id = event.target.attributes["data-record-id"].value;
    this.resetMarkings(categoryId);
    if (event.target.classList.contains("button")){
	    $(event.target).addClass("button-primary");
	    this.saveAnnotation(id,categoryId,100);
    } else{
	    let errorLevel = event.target.attributes["data-cat-level"].value;
	    $(event.target).addClass("error-level");
	    this.saveAnnotation(id,categoryId,errorLevel);
    }
  },
  getAnnotations(recordId){
    $.get('/annotate', { record_id:recordId }, (data) => {
        let newState = update(this.state,{annotations: { $set:data }});
        this.setState(newState);
        this.resetMarkings();
        for (var i = 0; i < this.state.annotations.length; i++) {;
          let current = this.state.annotations[i];
          this.setAnnotation(current.category_path_id,current.annotation_id);
        }
    });
  },
  setAnnotation(categoryId,annotationId){
    if (0 <= annotationId && annotationId <= 6){
      $('.category-block li[data-cat-level="'+annotationId+'"][data-category-id="'+categoryId+'"]').addClass('error-level');
    } else if (annotationId == 100){
      $('.category-block button[data-category-id="'+categoryId+'"]').addClass('button-primary');
    }

  },
  componentDidMount() {
    $.get('/feed', {}, (data) => {
      this.setState({records: data, currentIndex: 0});
      this.getAnnotations(data[0].id);
      });
    $(document).bind("keydown", "right", () => this.setIndex(this.getNextIndex()));
    $(document).bind("keydown", "left", () => this.setIndex(this.getPrevIndex()));
    /* binding keys for annotating category 1 */
    $(document).bind("keydown","shift+a",()=>$('.category-block li[data-category-id="1"][data-cat-level="0"]').click());
    $(document).bind("keydown","shift+s",()=>$('.category-block li[data-category-id="1"][data-cat-level="1"]').click());
    $(document).bind("keydown","shift+d",()=>$('.category-block li[data-category-id="1"][data-cat-level="2"]').click());
    $(document).bind("keydown","shift+f",()=>$('.category-block li[data-category-id="1"][data-cat-level="3"]').click());
    $(document).bind("keydown","shift+g",()=>$('.category-block li[data-category-id="1"][data-cat-level="4"]').click());
    $(document).bind("keydown","shift+h",()=>$('.category-block li[data-category-id="1"][data-cat-level="5"]').click());
    $(document).bind("keydown","shift+j",()=>$('.category-block li[data-category-id="1"][data-cat-level="6"]').click());
    $(document).bind("keydown","shift+z",()=>$('.category-block button[data-category-id="1"]').click());
    /* binding keys for annotating category 2 */
    $(document).bind("keydown","shift+q",()=>$('.category-block li[data-category-id="2"][data-cat-level="0"]').click());
    $(document).bind("keydown","shift+w",()=>$('.category-block li[data-category-id="2"][data-cat-level="1"]').click());
    $(document).bind("keydown","shift+e",()=>$('.category-block li[data-category-id="2"][data-cat-level="2"]').click());
    $(document).bind("keydown","shift+r",()=>$('.category-block li[data-category-id="2"][data-cat-level="3"]').click());
    $(document).bind("keydown","shift+t",()=>$('.category-block li[data-category-id="2"][data-cat-level="4"]').click());
    $(document).bind("keydown","shift+y",()=>$('.category-block li[data-category-id="2"][data-cat-level="5"]').click());
    $(document).bind("keydown","shift+u",()=>$('.category-block li[data-category-id="2"][data-cat-level="6"]').click());
    $(document).bind("keydown","shift+x",()=>$('.category-block button[data-category-id="2"]').click());
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
              <img className="u-full-width" src={"static/spot_check_images/"+item.id+".png"}/>
            </div>
            <div className="two columns">
              { this.renderPath(category_1,"category-1",item.id,1)}
            </div>
            <div className="two columns">
              { this.renderPath(category_2,"category-2",item.id,2)}
            </div>
          </div>
      </div>
      )
    } else {
      return <h4> Loading ....</h4> ;
    };
  }
})