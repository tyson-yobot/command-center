install:
	npm install && cd client && npm install && cd ..

dev:
	npm run dev

build:
	npm run build:client

serve:
	npm start

kill-node:
	taskkill //F //IM node.exe

check:
	npm run check

clean:
	rm -rf node_modules client/node_modules dist package-lock.json client/package-lock.json

reset: clean install
