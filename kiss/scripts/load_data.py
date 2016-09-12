""" Spotcheck data loader

Usage:
load_data.py --input <input_data> --job <job_description> [-p] [-d]

-h --help                   show this
-i --input=<input_file>     input json should contain the attributes url,breadcrumbs,category_1
-j --job=<job_description>  Description of the current spot checking job
-p                          use pentos export decoder
-d                          delete existing rows

"""

from docopt import docopt
import logging
import pandas as pd
import re
from kiss.models.classification import SpotCheckJob, ClassificationData

from sqlalchemy import create_engine,func
from sqlalchemy.orm import sessionmaker


def extract_status(task_run):
    status_dict = {}
    if len(task_run) > 0:
        status_dict['answer'] = task_run[0].get('answer', 'not_yet')
        status_dict['start_time'] = pd.to_datetime(task_run[0]['start_time'])
        status_dict['finish_time'] = pd.to_datetime(task_run[0]['finish_time'])
    return status_dict


def pentos_job_export_to_df(pentos_job_id, pentos_job_json):
    dq_exp = pd.read_json(pentos_job_json)
    task = dq_exp.task.apply(lambda x: pd.Series(x))

    status = dq_exp.taskRuns.apply(lambda x: pd.Series(extract_status(x)))
    dq_job_info = task.join(status, how='inner')
    dq_job_info['pentos_job_id'] = pentos_job_id
    return dq_job_info


def process_json(job_json):
    job_id = re.search(r'[^/]+/(\d+)\.json', job_json).group(1)
    print("Processing the job:{}".format(job_id))
    return pentos_job_export_to_df(job_id, job_json)


if __name__ == '__main__':
    FORMAT = '%(asctime)s %(levelname)s %(message)s'
    logging.basicConfig(level=logging.DEBUG, format=FORMAT)
    arguments = docopt(__doc__, version='DiffGen 0.1')
    print(arguments)

    engine = create_engine('postgresql+psycopg2://kiss:kiss@localhost:5432/postgres')
    Session = sessionmaker(bind=engine)
    session = Session()

    input_file = arguments.get("--input")
    input_data = process_json(input_file)

    job_desc = arguments.get("--job")
    job = session.query(SpotCheckJob).filter(SpotCheckJob.description == job_desc).one_or_none()
    if not job:
        job = SpotCheckJob(description=job_desc)
        session.add(job)
        session.commit()
    job_id = job.id

    delete_existing = arguments.get("-d")
    if delete_existing:
        row_count = session.query(ClassificationData).filter(ClassificationData.job_id == job_id).delete()
        session.commit()

    input_data = input_data.rename(columns={'id': 'pentos_id'})
    input_data['job_id'] = job_id

    db_cols = ['pentos_id', 'question', 'title', 'url', 'breadcrumb', 'categorypath1', 'categorypath2', 'imageurl',
               'answer', 'pentos_job_id', 'job_id']

    input_data[db_cols].to_sql('classification_data', engine, index=False, if_exists='append')
