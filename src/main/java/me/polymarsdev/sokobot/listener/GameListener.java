package me.polymarsdev.sokobot.listener;

import me.polymarsdev.sokobot.Bot;
import me.polymarsdev.sokobot.Game;
import me.polymarsdev.sokobot.util.GameUtil;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.MessageReaction;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.emoji.Emoji;
import net.dv8tion.jda.api.entities.emoji.UnicodeEmoji;
import net.dv8tion.jda.api.events.guild.GuildLeaveEvent;
import net.dv8tion.jda.api.events.message.react.MessageReactionAddEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class GameListener extends ListenerAdapter {

    @Override
    public void onGuildLeave(GuildLeaveEvent event) {
        Guild guild = event.getGuild();
        Bot.removePrefix(guild.getIdLong());
    }


    @Override
    public void onMessageReactionAdd(MessageReactionAddEvent event) {
        User user = event.getUser();
        if (user.isBot()) {
            return;
        }
        Guild guild = event.getGuild();
        MessageReaction reaction = event.getReaction();
        TextChannel channel = event.getChannel().asTextChannel();
        channel.retrieveMessageById(event.getMessageId()).queue(message -> {
            if (message.getAuthor().getId().equals(event.getJDA().getSelfUser().getId())) {
                Game game;
                if (!GameUtil.hasGame(user.getIdLong())) {
                    game = new Game(user);
                    GameUtil.setGame(user.getIdLong(), game);
                } else game = GameUtil.getGame(user.getIdLong());
                boolean reactionCommand = true;
                String userInput = "";

                
                UnicodeEmoji unicode = event.getReaction().getEmoji().asUnicode();
                if (unicode.equals(Emoji.fromUnicode("RE:U+2b05"))) {
                    userInput = "left";
                } else if (unicode.equals(Emoji.fromUnicode("RE:U+27a1"))) {
                    userInput = "right";
                } else if (unicode.equals(Emoji.fromUnicode("RE:U+2b06"))) {
                    userInput = "up";
                } else if (unicode.equals(Emoji.fromUnicode("RE:U+2b07"))) {
                    userInput = "down";
                } else if (unicode.equals(Emoji.fromUnicode("RE:U+1f504"))) {
                    userInput = "r";
                } else {
                    reactionCommand = false;
                }
                Bot.debug("Executing reaction input: " + userInput);
                if (reactionCommand) {
                    game.run(guild, channel, userInput);
                } else Bot.debug("Received invalid reaction command: " + event.getReaction().toString());
                if (guild.getSelfMember().hasPermission(channel, Permission.MESSAGE_MANAGE))
                    reaction.removeReaction(user).queue();
            }
        });
    }

}
