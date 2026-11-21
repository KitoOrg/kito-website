The registry of Kito's plugins (ADR 0008 in the kito repository).

index.json            every plugin: its name, one line, its latest version
plugins/<name>.json   one plugin: its versions, and the files of each

`kito plugin add <name>` reads these. A plugin is listed by a change to
these files, reviewed like any other: scripts/registry-add.sh writes a
plugin's file from an archive of it.
