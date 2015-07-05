#!/bin/bash

# explicitly attempt to fetch eggs before running
FETCH_WHEELS=1
SET_VENV=1
COPY_SAMPLE_FILES=1
for arg in "$@"; do
    [ "$arg" = "--skip-eggs" ] && FETCH_WHEELS=0
    [ "$arg" = "--skip-wheels" ] && FETCH_WHEELS=0
    [ "$arg" = "--skip-venv" ] && SET_VENV=0
    [ "$arg" = "--stop-daemon" ] && FETCH_WHEELS=0
    [ "$arg" = "--skip-samples" ] && COPY_SAMPLE_FILES=0
done

SAMPLES="
    config/migrated_tools_conf.xml.sample
    config/shed_tool_conf.xml.sample
    config/shed_tool_data_table_conf.xml.sample
    config/shed_data_manager_conf.xml.sample
    lib/tool_shed/scripts/bootstrap_tool_shed/user_info.xml.sample
    tool-data/shared/ucsc/builds.txt.sample
    tool-data/shared/ucsc/ucsc_build_sites.txt.sample
    tool-data/shared/igv/igv_build_sites.txt.sample
    tool-data/shared/rviewer/rviewer_build_sites.txt.sample
    tool-data/*.sample
    static/welcome.html.sample
"

RMFILES="
    lib/pkg_resources.pyc
"

if [ $COPY_SAMPLE_FILES -eq 1 ]; then
	# Create any missing config/location files
	for sample in $SAMPLES; do
		file=${sample%.sample}
	    if [ ! -f "$file" -a -f "$sample" ]; then
	        echo "Initializing $file from `basename $sample`"
	        cp $sample $file
	    fi
	done
fi

# remove problematic cached files
for rmfile in $RMFILES; do
    [ -f $rmfile ] && rm -f $rmfile
done

: ${GALAXY_CONFIG_FILE:=config/galaxy.ini}
if [ ! -f $GALAXY_CONFIG_FILE ]; then
    GALAXY_CONFIG_FILE=universe_wsgi.ini
fi
if [ ! -f $GALAXY_CONFIG_FILE ]; then
    GALAXY_CONFIG_FILE=config/galaxy.ini.sample
fi

if [ $SET_VENV -eq 1 ]; then
    # If not already in a virtualenv and .venv does not exist, attempt to create it.
    if [ -z "$VIRTUAL_ENV" -a ! -d .venv ]
    then
        vvers=13.1.0
        vurl="https://pypi.python.org/packages/source/v/virtualenv/virtualenv-${vvers}.tar.gz"
        if command -v virtualenv >/dev/null; then
            virtualenv .venv
        else
            vtmp=`mktemp -d -t galaxy-virtualenv-XXXXXX`
            vsrc="$vtmp/`basename $vurl`"
            ( if command -v curl >/dev/null; then
                curl --silent -o $vsrc $vurl
            elif command -v wget >/dev/null; then
                wget --quiet -O $vsrc $vurl
            else
                python -c "import urllib; urllib.urlretrieve('$vurl', '$vsrc')"
            fi ) &&
            tar zxf $vsrc -C $vtmp &&
            python $vtmp/virtualenv-$vvers/virtualenv.py .venv &&
            rm -rf $vtmp
        fi
    fi

    # If there is a .venv/ directory, assume it contains a virtualenv that we
    # should run this instance in.
    if [ -d .venv ];
    then
        printf "Activating virtualenv at %s/.venv\n" $(pwd)
        . .venv/bin/activate
    fi
fi

if [ -z "$VIRTUAL_ENV" ]; then
    echo "ERROR: A virtualenv cannot be found or created. Please create a virtualenv in .venv, or activate one."
    exit 1
fi


if [ $FETCH_WHEELS -eq 1 ]; then
    pip install -e git+https://github.com/natefoo/pip@linux-wheels#egg=pip
    PYTHONPATH=lib python -c "import galaxy.wheels; print '\n'.join(galaxy.wheels.requirements('$GALAXY_CONFIG_FILE'))" | pip install -r /dev/stdin --index-url https://wheels.galaxyproject.org/simple/
fi
