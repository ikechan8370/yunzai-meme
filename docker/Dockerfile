FROM ubuntu:20.04

RUN apt update && apt install -y python3-pip fonts-noto-cjk fonts-noto-color-emoji git fontconfig

RUN git clone https://github.com/MeetWq/meme-generator.git && mkdir /usr/share/fonts/meme && mv meme-generator/resources/fonts/* /usr/share/fonts/meme

RUN fc-cache -fv

RUN pip install meme_generator

RUN meme download

RUN git clone https://github.com/MeetWq/meme-generator-contrib  && mkdir /meme-extend && mv meme-generator-contrib/memes/* /meme-extend

ADD config.toml /root/.config/meme_generator/config.toml

ADD config.toml ~/.config/meme_generator/config.toml

RUN meme download

RUN rm -rf meme-generator-contrib && rm -rf meme-generator

CMD ["meme", "run"]