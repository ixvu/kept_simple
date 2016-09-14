"""Spot check url scraper

Usage:
scraper.py --input=<input_data> --output=<output_dir> [--num_workers=<3>]

-h --help                   show this
-i --input=<input_file>     input json
-o --output=<output_dir>    output directory
-n --num_workers=<num>      number of workers [default: 3]

"""
import pandas as pd
from docopt import docopt
import logging
import sys
from subprocess import Popen, PIPE
import time
import os

FORMAT = '%(asctime)s %(levelname)s %(message)s'
logging.basicConfig(level=logging.DEBUG, format=FORMAT)

if __name__ == '__main__':
    arguments = docopt(__doc__, version='scraper 0.1')
    logging.debug("The provided arguments are \n {}".format(arguments))
    input_file = arguments.get("--input")
    output = arguments.get("--output")
    os.makedirs(output,exist_ok=True)
    tmp_ = output + "/.tmp"
    os.makedirs(tmp_, exist_ok=True)
    num_workers = int(arguments.get("--num_workers"))
    try:
        spot_check_data = pd.read_json(input_file)
    except ValueError as e:
        logging.error("Unable to load the input json file: {}".format(input_file))
        sys.exit(1)

    num_records = spot_check_data.shape[0]
    logging.info("The input json contain {} records".format(num_records))
    num_parts = num_records // num_workers
    logging.debug("creating {} workers".format(num_workers))
    sub_processes = []
    tmp_files = []
    for ix in range(0, num_records, num_parts):
        part_file = tmp_ + '/part_{}.json'.format(ix)
        tmp_files.append(part_file)
        spot_check_data.iloc[ix:ix + num_parts].to_json(part_file, orient='records')
        sub_process = Popen(["node", "index.js", "--input", part_file], stdout=PIPE, stderr=PIPE)
        sub_processes.append(sub_process)
    logging.debug("launched {} workers".format(len(sub_processes)))


    def all_done(processes):
        done = True
        for proc in processes:
            proc.poll()
            if proc.returncode is None:
                done = False
                break
        return done


    while True:
        if all_done(sub_processes):
            for tmp_file in tmp_files:
                os.remove(tmp_file)
            os.rmdir(tmp_)
            logging.debug("Scraping task completed. Exiting..")
            sys.exit(0)
        else:
            time.sleep(30)
