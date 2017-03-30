democracy now! downloader
-------------------------
a simple node app that downloads the latest Democracy Now! show. only works on macos and probably linux, but it would probs be pretty easy to get it working on windows (just take a look at that `open` command o_o)

installation
------------
```
git clone https://github.com/jayvachon/democracy-now-downloader.git
npm install
```

optionally alias the app for minimal future effort:

**1.** open bash profile:
```
sudo nano ~/.bash_profile
```
**2.** add the alias:
```
alias dn="cd ~/path/to/democracy-now-downloader;node index.js"
```
**3.** save it :)
```
source ~/.bash_profile
```

running it
----------
if you didn't create the alias, instead of using `dn` you'll want to use `node index.js`

* `dn dap` ~ downloads and plays the latest show
* `dn download` ~ downloads the latest show (but doesn't play it)
* `dn play` ~ plays the latest show
* `dn list` ~ lists the shows you've downloaded
* `dn clean` ~ deletes all the shows you've downloaded

by default, simply running `dn` will default to the `dn dap` command
