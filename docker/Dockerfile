FROM ubuntu:20.04

RUN apt update && apt install -y python3-pip fonts-noto-cjk fonts-noto-color-emoji git fontconfig

RUN git clone https://github.com/MeetWq/meme-generator.git && mkdir /usr/share/fonts/meme && mv meme-generator/resources/fonts/* /usr/share/fonts/meme

RUN fc-cache -fv

RUN pip install poetry

RUN git clone https://github.com/MeetWq/meme-generator-contrib  && mkdir /meme-extend && mv meme-generator-contrib/memes/* /meme-extend

ADD config.toml /root/.config/meme_generator/config.toml

RUN cd meme-generator && poetry install && . .venv/bin/activate && python -m meme_generator.download && cd ..

RUN rm -rf meme-generator-contrib && rm -rf $HOME/meme-generator

ADD utils.py meme-generator/meme_generator

ADD dianzhongdian/__init__.py meme-generator/meme_generator/memes/dianzhongdian/
# 如果有自己扩展包
# ADD extends/ /meme-extend

CMD cd meme-generator && . .venv/bin/activate && python3 -m meme_generator.app
