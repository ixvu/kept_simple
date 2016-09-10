""" Spotcheck data loader

Usage:
load_data.py --input <input_data> [-p]

-h --help                 show this
-i --input=<input_file>   input json should contain the attributes url,breadcrumbs,category_1
-p                        use pentos export decoder

"""

from docopt import docopt
import logging
import pandas as pd
import re

from sqlalchemy import create_engine


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
    dq_job_info['job_id'] = pentos_job_id
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

    input_file = arguments.get("--input")
    input_data = process_json(input_file)

    input_data = input_data.rename(columns={'id':'pentos_id'})

    db_cols = ['pentos_id', 'question', 'title', 'url', 'breadcrumb', 'categorypath1', 'categorypath2', 'imageurl', 'answer', 'job_id']

    engine = create_engine('postgresql+psycopg2://kiss:kiss@localhost:5432/postgres')

    input_data[db_cols].to_sql('classification_data', engine, index=False, if_exists='append')
