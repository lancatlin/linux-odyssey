PROMPT='%n@%m:%~%# '
unsetopt CASE_GLOB
setopt CHASE_LINKS
emulate bash

typeset -A cmd

preexec() {
    export CMD_START_TIME=$(date +%s%N)      # capture start time
    export CMD_NAME=$1                   # capture command

    # A list of interactive commands
    interactive_commands=("vim" "nano" "top" "ssh" "less" "zsh" "bash")

    # Check if the command is in the list of interactive commands
    if [[ " ${interactive_commands[@]} " =~ " $1 " ]]; then
        # If it is, just execute it normally
        exec
    else
        # If it's not, execute it and redirect its output to a file
        exec > >(tee /tmp/cmd.out) 2> >(tee /tmp/cmd.error >&2)
    fi
}

precmd() {
    export CMD_END_TIME=$(date +%s%N)   # capture end time
    export CMD_EXIT_CODE=$?               # capture exit status
    export CMD_OUTPUT_FILE=/tmp/cmd.out # read command output from file
    export CMD_ERROR_FILE=/tmp/cmd.error

    # Now run your Node.js script with the result as an argument
    node /usr/local/lib/cli/cli.js

    rm /tmp/cmd.out /tmp/cmd.error 2>/dev/null # cleanup
}

