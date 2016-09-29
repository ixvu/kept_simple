"""Spot check url scraper

Usage:
scraper.py --input=<input_data> [--output=<output_dir> --status=<status_json> --num_workers=<3>]

-h --help                   show this
-i --input=<input_file>     input json
-o --output=<output_dir>    output directory
-s --status=<status_file>   status json to save http status of urls [default: overall_status.json]
-n --num_workers=<num>      number of workers [default: 3]

"""
import pandas as pd
from docopt import docopt
import logging
import sys
from subprocess import Popen, STDOUT
import time
import os
import json
import zipfile
import time

FORMAT = '%(asctime)s %(levelname)s %(message)s'
logging.basicConfig(level=logging.DEBUG, format=FORMAT)


def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), arcname=file)

if __name__ == '__main__':
    arguments = docopt(__doc__, version='scraper 0.1')
    logging.debug("The provided arguments are \n {}".format(arguments))
    input_file = arguments.get("--input")
    output = arguments.get("--output")
    if not output:
        output = "/tmp/scraper_output_{}".format(int(time.time()))
    overall_status = arguments.get("--status")
    os.makedirs(output, exist_ok=True)
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
    status_files = []
    for ix in range(0, num_records, num_parts):
        part_file = tmp_ + '/part_{}.json'.format(ix)
        status_file = tmp_ + '/status_{}.json'.format(ix)
        log_file = tmp_ + '/run_{}.log'.format(ix)
        tmp_files.append(part_file)
        status_files.append(status_file)
        spot_check_data.iloc[ix:ix + num_parts].to_json(part_file, orient='records')
        sub_process = Popen(["node", "index.js", "--input", part_file, "--status", status_file, "--output", output],
                            stdout=open(log_file,'w'),
                            stderr=STDOUT)
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
            statuses = {}
            for tmp_file in tmp_files:
                os.remove(tmp_file)
            for stat in status_files:
                if os.path.exists(stat):
                    statuses.update(json.load(open(stat)))
                    os.remove(stat)
            json.dump(statuses, open(output + "/" + overall_status, 'w'))
            os.rmdir(tmp_)
            logging.debug("zipping the scraper output.")
            output_zip = 'scraper_output.zip'
            zipf = zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED)
            zipdir(output, zipf)
            zipf.close()
            logging.debug("zip completed.")
            logging.debug("Scraping task completed. Exiting..")
            sys.exit(0)
        else:
            time.sleep(30)
