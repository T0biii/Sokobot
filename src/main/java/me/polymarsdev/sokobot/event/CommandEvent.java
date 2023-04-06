package me.polymarsdev.sokobot.event;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.*;
import net.dv8tion.jda.api.entities.channel.unions.MessageChannelUnion;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class CommandEvent {
    private static final int MAX_MESSAGES = 2;

    private final MessageReceivedEvent event;
    private String[] args;

    public CommandEvent(MessageReceivedEvent event, String[] args) {
        this.event = event;
        this.args = args;
    }

    public String[] getArgs() {
        return args;
    }

    public MessageReceivedEvent getEvent() {
        return event;
    }

    public List<Member> getMentionedMembers() {

        List<Member> mentionedMembers = new ArrayList<>(event.getMessage().getMentions().getMembers());
        if (event.getMessage().getContentRaw().startsWith("<@!" + event.getJDA().getSelfUser().getId() + ">"))
            mentionedMembers.remove(0);
        return mentionedMembers;
    }

    public void reply(String message) {
        sendMessage(event.getChannel(), message);
    }

    public void reply(String message, Consumer<Message> success) {
        sendMessage(event.getChannel(), message, success);
    }

    public void reply(String message, Consumer<Message> success, Consumer<Throwable> failure) {
        sendMessage(event.getChannel(), message, success, failure);
    }

    public void reply(MessageEmbed embed) {
        event.getChannel().sendMessageEmbeds(embed).queue();
    }




    private void sendMessage(MessageChannelUnion chan, String message) {
        ArrayList<String> messages = splitMessage(message);
        for (int i = 0; i < MAX_MESSAGES && i < messages.size(); i++) {
            chan.sendMessage(messages.get(i)).queue();
        }
    }

    private void sendMessage(MessageChannelUnion chan, String message, Consumer<Message> success) {
        ArrayList<String> messages = splitMessage(message);
        for (int i = 0; i < MAX_MESSAGES && i < messages.size(); i++) {
            if (i + 1 == MAX_MESSAGES || i + 1 == messages.size()) {
                chan.sendMessage(messages.get(i)).queue(success);
            } else {
                chan.sendMessage(messages.get(i)).queue();
            }
        }
    }

    private void sendMessage(MessageChannelUnion chan, String message, Consumer<Message> success,
                             Consumer<Throwable> failure) {
        ArrayList<String> messages = splitMessage(message);
        for (int i = 0; i < MAX_MESSAGES && i < messages.size(); i++) {
            if (i + 1 == MAX_MESSAGES || i + 1 == messages.size()) {
                chan.sendMessage(messages.get(i)).queue(success, failure);
            } else {
                chan.sendMessage(messages.get(i)).queue();
            }
        }
    }

    private static ArrayList<String> splitMessage(String stringtoSend) {
        ArrayList<String> msgs = new ArrayList<>();
        if (stringtoSend != null) {
            stringtoSend = stringtoSend.replace("@everyone", "@\u0435veryone").replace("@here", "@h\u0435re").trim();
            while (stringtoSend.length() > 2000) {
                int leeway = 2000 - (stringtoSend.length() % 2000);
                int index = stringtoSend.lastIndexOf("\n", 2000);
                if (index < leeway) index = stringtoSend.lastIndexOf(" ", 2000);
                if (index < leeway) index = 2000;
                String temp = stringtoSend.substring(0, index).trim();
                if (!temp.equals("")) msgs.add(temp);
                stringtoSend = stringtoSend.substring(index).trim();
            }
            if (!stringtoSend.equals("")) msgs.add(stringtoSend);
        }
        return msgs;
    }

    SelfUser getSelfUser() {
        return event.getJDA().getSelfUser();
    }

    public User getAuthor() {
        return event.getAuthor();
    }

    public Guild getGuild() {
        return event.getGuild();
    }

    public JDA getJDA() {
        return event.getJDA();
    }

    public Member getMember() {
        return event.getMember();
    }

    public Message getMessage() {
        return event.getMessage();
    }

    public MessageChannelUnion getTextChannel() {
        return event.getChannel();
    }
}