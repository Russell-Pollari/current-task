# current-task

CLI application for tracking tasks throughout the day

![example][screenshot.png]

## Install
- Clone this repo  
- `$ npm install | npm link`

## Usage

**Show summary of day**
```
$ current-task show
```

**Add a TODO**
```
$ current-task add <title> -t <type>
```
`title`: description of task
`type`: type/tag for task  
`

**Set current task**
```
$ current-task set <title || index> -t <type> -o <offset>
```
`title`: description of task
**OR**
`index`: index of TODO to set  
`type`: type/tag for task  
`offset`: offset in minutes for start time of task  

**Mark current task as done**
```
$ current-task done -o <offset>
```
Moves current task to finished tasks  
`offset`: offset in minutes for finish time of task

**Pause current task**
```
$ current-task pause -o <offset>
```
Moves current task to finished and back to todo  
`offset`: offset in minutes for finish time of task

**Clear finished tasks**
```
$ current-task clear
```

**Remove a TODO**
```
$ current-task <index>
```
Remove TODO with `index`
