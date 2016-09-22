-- combining multiple user annotations with higher priority to error
drop view if exists user_annotations_v CASCADE
;
create or replace view user_annotations_v as
SELECT
categorypath_id,record_id,min(annotation_id) annotation_id
from user_annotations
group by categorypath_id,record_id
;

-- level wise annotation summary
DROP VIEW IF EXISTS level_wise_summary CASCADE
;
create or replace view level_wise_summary as
select
ua.job_id,
a.id,
a.description,
ua.categorypath_id,
ua.count as count
from
annotations a
left join
(
   select
   cd.job_id,ua.categorypath_id,ua.annotation_id,count(*) as count
   from user_annotations_v ua
   join classification_data cd on (cd.id = ua.record_id)
   group by cd.job_id,ua.categorypath_id,ua.annotation_id
)
ua on (a.id = ua.annotation_id)
order by ua.job_id,a.id,categorypath_id
;

-- create a view for record wise comparison across categories
drop view if exists cat_record_annotations_v CASCADE
;
create or replace view cat_record_annotations_v as
select
COALESCE(c1.record_id,c2.record_id) record_id,
c1.annotation_id c1_annotation_id,
c2.annotation_id c2_annotation_id,
cd.*
from
(
   SELECT
   uv.record_id,uv.annotation_id
   FROM user_annotations_v uv
   where uv.categorypath_id = 1
)
c1 full outer
join
(
   SELECT
   uv.record_id,uv.annotation_id
   FROM user_annotations_v uv
   where uv.categorypath_id = 2
)
c2 on (c1.record_id = c2.record_id)
join classification_data cd on (c1.record_id = cd.id or c2.record_id = cd.id)
;

-- a view to see the spot check summary 
DROP VIEW IF EXISTS spot_check_summary_v CASCADE
;
create or replace view spot_check_summary_v as
SELECT
job_id,
sum(case when c1_annotation_id = c2_annotation_id THEN 1 ELSE 0 END) as both_same,
sum(case when c1_annotation_id = c2_annotation_id AND c1_annotation_id= 100 THEN 1 ELSE 0 END) as both_same_correct,
sum(case when c1_annotation_id = c2_annotation_id AND c1_annotation_id!= 100 THEN 1 ELSE 0 END) as both_same_wrong,
sum(case when c1_annotation_id < 100 AND c2_annotation_id < 100 THEN 1 ELSE 0 END) as both_wrong,
sum(case when c1_annotation_id = 100 AND c2_annotation_id = 100 THEN 1 ELSE 0 END) as both_correct,
sum(case when c1_annotation_id != c2_annotation_id AND c1_annotation_id= 100 THEN 1 ELSE 0 END) as c1_only_correct,
sum(case when c1_annotation_id != c2_annotation_id AND c2_annotation_id= 100 THEN 1 ELSE 0 END) as c2_only_correct,
sum(case when c1_annotation_id= 100 THEN 1 ELSE 0 END) as c1_correct,
sum(case when c2_annotation_id= 100 THEN 1 ELSE 0 END) as c2_correct,
sum(case when c1_annotation_id= 0 THEN 1 ELSE 0 END) as c1_top_level,
sum(case when c1_annotation_id= 1 THEN 1 ELSE 0 END) as c1_level_1,
sum(case when c1_annotation_id= 2 THEN 1 ELSE 0 END) as c1_level_2,
sum(case when c1_annotation_id= 3 THEN 1 ELSE 0 END) as c1_level_3,
sum(case when c1_annotation_id= 4 THEN 1 ELSE 0 END) as c1_level_4,
sum(case when c1_annotation_id= 5 THEN 1 ELSE 0 END) as c1_level_5,
sum(case when c2_annotation_id= 0 THEN 1 ELSE 0 END) as c2_top_level,
sum(case when c2_annotation_id= 1 THEN 1 ELSE 0 END) as c2_level_1,
sum(case when c2_annotation_id= 2 THEN 1 ELSE 0 END) as c2_level_2,
sum(case when c2_annotation_id= 3 THEN 1 ELSE 0 END) as c2_level_3,
sum(case when c2_annotation_id= 4 THEN 1 ELSE 0 END) as c2_level_4,
sum(case when c2_annotation_id= 5 THEN 1 ELSE 0 END) as c2_level_5,
count(*) total_spot_checked
FROM cat_record_annotations_v
group by job_id
;

-- domain wise spot check summary
DROP  VIEW IF EXISTS dw_spot_check_summary_v CASCADE
;
create or replace view dw_spot_check_summary_v as
SELECT
crv.job_id,
regexp_replace(cd.url,'http[s]?://(www\.)?([^/]+)/.*','\2') as domain,
sum(case when c1_annotation_id = c2_annotation_id THEN 1 ELSE 0 END) as both_same,
sum(case when c1_annotation_id = c2_annotation_id AND c1_annotation_id= 100 THEN 1 ELSE 0 END) as both_same_correct,
sum(case when c1_annotation_id = c2_annotation_id AND c1_annotation_id!= 100 THEN 1 ELSE 0 END) as both_same_wrong,
sum(case when c1_annotation_id < 100 AND c2_annotation_id < 100 THEN 1 ELSE 0 END) as both_wrong,
sum(case when c1_annotation_id = 100 AND c2_annotation_id = 100 THEN 1 ELSE 0 END) as both_correct,
sum(case when c1_annotation_id != c2_annotation_id AND c1_annotation_id= 100 THEN 1 ELSE 0 END) as c1_only_correct,
sum(case when c1_annotation_id != c2_annotation_id AND c2_annotation_id= 100 THEN 1 ELSE 0 END) as c2_only_correct,
sum(case when c1_annotation_id= 100 THEN 1 ELSE 0 END) as c1_correct,
sum(case when c2_annotation_id= 100 THEN 1 ELSE 0 END) as c2_correct,
sum(case when c1_annotation_id= 0 THEN 1 ELSE 0 END) as c1_top_level,
sum(case when c1_annotation_id= 1 THEN 1 ELSE 0 END) as c1_level_1,
sum(case when c1_annotation_id= 2 THEN 1 ELSE 0 END) as c1_level_2,
sum(case when c1_annotation_id= 3 THEN 1 ELSE 0 END) as c1_level_3,
sum(case when c1_annotation_id= 4 THEN 1 ELSE 0 END) as c1_level_4,
sum(case when c1_annotation_id= 5 THEN 1 ELSE 0 END) as c1_level_5,
sum(case when c2_annotation_id= 0 THEN 1 ELSE 0 END) as c2_top_level,
sum(case when c2_annotation_id= 1 THEN 1 ELSE 0 END) as c2_level_1,
sum(case when c2_annotation_id= 2 THEN 1 ELSE 0 END) as c2_level_2,
sum(case when c2_annotation_id= 3 THEN 1 ELSE 0 END) as c2_level_3,
sum(case when c2_annotation_id= 4 THEN 1 ELSE 0 END) as c2_level_4,
sum(case when c2_annotation_id= 5 THEN 1 ELSE 0 END) as c2_level_5,
count(*) total_spot_checked
FROM cat_record_annotations_v crv
join classification_data cd on (crv.record_id = cd.id)
group by crv.job_id,domain
;

