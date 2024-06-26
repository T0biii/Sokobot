package me.polymarsdev.sokobot.listener;

import me.polymarsdev.sokobot.Bot;
import me.polymarsdev.sokobot.commands.GameInputCommand;
import me.polymarsdev.sokobot.commands.InfoCommand;
import me.polymarsdev.sokobot.commands.PrefixCommand;
import me.polymarsdev.sokobot.entity.Command;
import me.polymarsdev.sokobot.event.CommandEvent;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.interactions.commands.build.Commands;

import java.util.*;

public class CommandListener extends ListenerAdapter {
    private static final ArrayList<String> commandsNoPrefix = new ArrayList<>(
            Arrays.asList("w", "a", "s", "d", "up", "left", "down", "right", "r", "mr"));
    private static final HashMap<String, Command> commands = new HashMap<>();

    public CommandListener() {
        List<Command> botCommands = new ArrayList<>(Arrays.asList(new InfoCommand(), new PrefixCommand()));
        botCommands.addAll(Arrays.asList(new GameInputCommand("play"), new GameInputCommand("continue"),
                                         new GameInputCommand("stop")));
        for (String cnp : commandsNoPrefix) botCommands.add(new GameInputCommand(cnp));
        for (Command command : botCommands) commands.put(command.getName().toLowerCase(), command);
        System.out.println("[INFO] Loaded " + commands.size() + " commands");
    }


    @Override
    public void onReady(ReadyEvent event){
        System.out.println("Total:" +event.getGuildTotalCount() + " Available: " + event.getGuildAvailableCount() +" Unavailable: " + event.getGuildUnavailableCount());

        JDA jda = event.getJDA();
        jda.updateCommands().addCommands(
                Commands.slash("hello", "Says hello")
        ).queue();

    }

    @Override
    public void onSlashCommandInteraction(SlashCommandInteractionEvent event) {
        if (event.getName().equals("hello")) {
            long time = System.currentTimeMillis();
            event.reply("Pong!").setEphemeral(true) // reply or acknowledge
                    .flatMap(v ->
                            event.getHook().editOriginalFormat("Pong: %d ms", System.currentTimeMillis() - time) // then edit original
                    ).queue(); // Queue both reply and edit
        }
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        User user = event.getAuthor();
        Message message = event.getMessage();
        TextChannel channel = event.getChannel().asTextChannel();
        Guild guild = event.getGuild();
        String msgRaw = message.getContentRaw();
        String[] args = msgRaw.split("\\s+");
        if (args.length > 0) {
            boolean isMention = msgRaw.equals("<@" + event.getJDA().getSelfUser().getId() + ">") || msgRaw
                    .equals("<@!" + event.getJDA().getSelfUser().getId() + ">");
            String prefix = Bot.getPrefix(guild);
            String arg = args[0].toLowerCase();
            boolean isCommand;
            if (isMention) isCommand = true;
            else {
                if (arg.startsWith(prefix)) {
                    if (commandsNoPrefix.contains(arg)) {
                        isCommand = true;
                    } else {
                        String commandName = arg.substring(prefix.length()).toLowerCase();
                        isCommand = commands.containsKey(commandName);
                        if (isCommand) arg = commandName;
                    }
                } else {
                    isCommand = commandsNoPrefix.contains(arg);
                }
            }
            if (isCommand) {
                Bot.debug("Command received: " + arg);
                if (!hasPermissions(guild, channel)) {
                    Bot.debug("Not enough permissions to run command: " + arg);
                    sendInvalidPermissionsMessage(user, channel);
                    return;
                }
                Command command = commands.get(arg);
                if (isMention) command = commands.get("info");
                if (command == null) {
                    Bot.debug("Received command does not exist: " + arg);
                    return;
                }
                Bot.debug("Executing command: " + arg);
                command.execute(new CommandEvent(event, Arrays.copyOfRange(msgRaw.split("\\s+"), 1, args.length)));
            }
        }
    }

    private static final Collection<Permission> requiredPermissions = Arrays
            .asList(Permission.MESSAGE_ADD_REACTION, Permission.MESSAGE_EMBED_LINKS, Permission.MESSAGE_MANAGE,
                    Permission.MESSAGE_SEND);

    private boolean hasPermissions(Guild guild, TextChannel channel) {
        Member self = guild.getSelfMember();
        if (self.hasPermission(Permission.ADMINISTRATOR)) return true;
        return self.hasPermission(channel, requiredPermissions);
    }

    private void sendInvalidPermissionsMessage(User user, TextChannel channel) {
        if (channel.canTalk()) {
            StringBuilder requiredPermissionsDisplay = new StringBuilder();
            for (Permission requiredPermission : requiredPermissions) {
                requiredPermissionsDisplay.append("`").append(requiredPermission.getName()).append("`, ");
            }
            if (requiredPermissionsDisplay.toString().endsWith(", ")) requiredPermissionsDisplay = new StringBuilder(
                    requiredPermissionsDisplay.substring(0, requiredPermissionsDisplay.length() - 2));
            channel.sendMessage(user.getAsMention() + ", I don't have enough permissions to work properly.\nMake "
                                        + "sure I have the following permissions: " + requiredPermissionsDisplay
                                        + "\nIf you think this is "
                                        + "an error, please contact a server administrator.").queue();
        }
    }
}